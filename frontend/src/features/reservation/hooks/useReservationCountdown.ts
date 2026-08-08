import {
  useEffect,
  useMemo,
  useState,
} from 'react';

interface ReservationCountdown {
  remainingMilliseconds: number;
  remainingText: string;
  expired: boolean;
}

export function useReservationCountdown(
    expiresAt: string | null | undefined,
): ReservationCountdown {
  const expiresAtTime = useMemo(() => {
    if (!expiresAt) {
      return null;
    }

    const parsed =
        new Date(expiresAt).getTime();

    return Number.isNaN(parsed)
        ? null
        : parsed;
  }, [expiresAt]);

  const [
    remainingMilliseconds,
    setRemainingMilliseconds,
  ] = useState(() =>
      calculateRemaining(expiresAtTime),
  );

  useEffect(() => {
    setRemainingMilliseconds(
        calculateRemaining(
            expiresAtTime,
        ),
    );

    if (!expiresAtTime) {
      return;
    }

    const intervalId =
        window.setInterval(() => {
          const remaining =
              calculateRemaining(
                  expiresAtTime,
              );

          setRemainingMilliseconds(
              remaining,
          );

          if (remaining <= 0) {
            window.clearInterval(
                intervalId,
            );
          }
        }, 1000);

    return () => {
      window.clearInterval(
          intervalId,
      );
    };
  }, [expiresAtTime]);

  const expired =
      expiresAtTime !== null &&
      remainingMilliseconds <= 0;

  return {
    remainingMilliseconds,
    expired,
    remainingText:
        formatRemainingTime(
            remainingMilliseconds,
        ),
  };
}

function calculateRemaining(
    expiresAtTime: number | null,
): number {
  if (!expiresAtTime) {
    return 0;
  }

  return Math.max(
      0,
      expiresAtTime - Date.now(),
  );
}

function formatRemainingTime(
    milliseconds: number,
): string {
  const totalSeconds =
      Math.floor(
          milliseconds / 1000,
      );

  const minutes =
      Math.floor(
          totalSeconds / 60,
      );

  const seconds =
      totalSeconds % 60;

  return [
    String(minutes).padStart(
        2,
        '0',
    ),
    String(seconds).padStart(
        2,
        '0',
    ),
  ].join(':');
}
