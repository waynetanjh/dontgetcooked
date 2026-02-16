import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private telegramService: TelegramService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, telegramUsername } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if there's a pending Telegram link for this username
    const pendingLink = await this.prisma.pendingTelegramLink.findFirst({
      where: {
        telegramUsername: {
          equals: telegramUsername,
          mode: 'insensitive',
        },
      },
    });

    // Create user, auto-linking chatId if a pending link exists
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        telegramUsername,
        ...(pendingLink && {
          chatId: pendingLink.chatId,
          chatLinkedAt: new Date(),
        }),
      },
    });

    // If we auto-linked, clean up the pending record and notify the user via Telegram
    if (pendingLink) {
      await this.prisma.pendingTelegramLink.delete({
        where: { id: pendingLink.id },
      });

      const confirmationMessage = `
✅ <b>Setup Complete!</b>

Your account (<b>${email}</b>) has been created and linked to this chat.

You'll now receive daily notifications at 9:00 AM (SGT) for your events.

Head to the app to start adding your important dates! 🎉
      `.trim();

      try {
        await this.telegramService.sendMessageToChat(
          pendingLink.chatId,
          confirmationMessage,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to send Telegram confirmation to chat ${pendingLink.chatId}: ${error.message}`,
        );
      }
    }

    // Generate token
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          telegramUsername: user.telegramUsername,
        },
        token,
      },
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          telegramUsername: user.telegramUsername,
        },
        token,
      },
      message: 'Login successful',
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        telegramUsername: true,
      },
    });

    return user;
  }
}
