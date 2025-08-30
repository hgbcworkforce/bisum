import { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        // Conference has started
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { value: countdown.days, label: 'Days' },
    { value: countdown.hours, label: 'Hours' },
    { value: countdown.minutes, label: 'Minutes' },
    { value: countdown.seconds, label: 'Seconds' }
  ];

  return (
    <div className="mb-10">
      <p className="text-lg text-gray-300 mb-4">Conference starts in:</p>
      <div className="flex justify-center space-x-4 sm:space-x-6 lg:space-x-8">
        {timeUnits.map((unit, index) => (
          <div key={index} className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px] sm:min-w-[100px] border border-white/10">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                {unit.value.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-300">{unit.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
