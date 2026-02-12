import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { RegisterDto, ApiResponse, User } from '@fidevoltz/types';

export async function POST(request: NextRequest) {
  try {
    // Check registration settings
    const settings = await prisma.siteSettings.findMany({
      where: {
        key: {
          in: ['general.allowRegistration', 'general.requireEmailVerification']
        }
      }
    });

    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    const allowRegistration = settingsMap['general.allowRegistration'] !== false && settingsMap['general.allowRegistration'] !== 'false';
    const requireEmailVerification = settingsMap['general.requireEmailVerification'] === true || settingsMap['general.requireEmailVerification'] === 'true';

    if (!allowRegistration) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Registration is currently disabled' },
        { status: 403 }
      );
    }

    const body: RegisterDto = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: 'USER',
        status: requireEmailVerification ? 'pending_verification' : 'active',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        address: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json<ApiResponse<User>>(
      {
        success: true,
        data: user as User,
        message: 'User registered successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'An error occurred during registration',
      },
      { status: 500 }
    );
  }
}
