"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: number | string | Date;
  variant?: "hero" | "card";
}

export default function CountdownTimer({ targetDate, variant = "hero" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isHero = variant === "hero";

  const containerClasses = isHero
    ? "flex items-center justify-center gap-2 sm:gap-4 my-6"
    : "flex items-center justify-center gap-2 my-4";

  const blockClasses = isHero
    ? "flex flex-col items-center justify-center bg-slate-900/90 border border-slate-700/80 rounded-lg w-16 h-18 sm:w-22 sm:h-22"
    : "flex flex-col items-center justify-center bg-slate-100 border border-slate-200 rounded-lg w-14 h-15 sm:w-16 sm:h-16";

  const numberClasses = isHero
    ? "font-mono text-2xl sm:text-4xl font-bold text-white tracking-tight"
    : "font-mono text-xl sm:text-2xl font-bold text-slate-900 tracking-tight";

  const labelClasses = isHero
    ? "text-[9px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5"
    : "text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider";

  const separatorClasses = isHero
    ? "text-xl sm:text-3xl font-bold text-slate-600 self-center"
    : "text-lg sm:text-xl font-bold text-slate-300 self-center";

  return (
    <div className={containerClasses}>
      <div className={blockClasses}>
        <span className={numberClasses}>
          {timeLeft.days.toString().padStart(2, "0")}
        </span>
        <span className={labelClasses}>Days</span>
      </div>

      <span className={separatorClasses}>:</span>

      <div className={blockClasses}>
        <span className={numberClasses}>
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        <span className={labelClasses}>Hours</span>
      </div>

      <span className={separatorClasses}>:</span>

      <div className={blockClasses}>
        <span className={numberClasses}>
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        <span className={labelClasses}>Mins</span>
      </div>

      <span className={separatorClasses}>:</span>

      <div className={blockClasses}>
        <span className={numberClasses}>
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
        <span className={labelClasses}>Secs</span>
      </div>
    </div>
  );
}
