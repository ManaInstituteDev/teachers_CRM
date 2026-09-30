// سیستم محدودیت تلاش برای ورود (Rate Limiting)
// ۵ بار تلاش اشتباه = ۱ دقیقه قفل موقت

interface AttemptRecord {
  count: number;
  lockoutUntil: number | null;
  lastAttempt: number;
}

const attempts = new Map<string, AttemptRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // ۶۰ ثانیه (۱ دقیقه)

// پاکسازی رکوردهای قدیمی‌تر از ۱۰ دقیقه برای جلوگیری از مصرف حافظه
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attempts.entries()) {
    if (record.lockoutUntil && record.lockoutUntil < now && now - record.lastAttempt > 10 * 60 * 1000) {
      attempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkLoginAttempts(identifier: string): {
  isLocked: boolean;
  remainingSeconds: number;
  remainingAttempts: number;
} {
  const key = identifier.trim().toLowerCase();
  const record = attempts.get(key);
  const now = Date.now();

  if (!record) {
    return {
      isLocked: false,
      remainingSeconds: 0,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
    };
  }

  // اگر کاربر در وضعیت قفل است
  if (record.lockoutUntil && record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      remainingAttempts: 0,
    };
  }

  // اگر زمان قفل به اتمام رسیده باشد، شمارنده را ریست می‌کنیم
  if (record.lockoutUntil && record.lockoutUntil <= now) {
    attempts.delete(key);
    return {
      isLocked: false,
      remainingSeconds: 0,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
    };
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.count),
  };
}

export function recordFailedLogin(identifier: string): {
  isLocked: boolean;
  remainingSeconds: number;
  remainingAttempts: number;
  currentCount: number;
} {
  const key = identifier.trim().toLowerCase();
  const now = Date.now();
  let record = attempts.get(key);

  if (!record || (record.lockoutUntil && record.lockoutUntil <= now)) {
    record = {
      count: 0,
      lockoutUntil: null,
      lastAttempt: now,
    };
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    attempts.set(key, record);
    return {
      isLocked: true,
      remainingSeconds: 60,
      remainingAttempts: 0,
      currentCount: record.count,
    };
  }

  attempts.set(key, record);
  return {
    isLocked: false,
    remainingSeconds: 0,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.count,
    currentCount: record.count,
  };
}

export function resetLoginAttempts(identifier: string) {
  const key = identifier.trim().toLowerCase();
  attempts.delete(key);
}
