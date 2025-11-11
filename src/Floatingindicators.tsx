
const FloatingIndicators = () => {
    // יצירת מערך של אינדיקטורים עם מיקום ומהירות רנדומליים
    const indicators = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (20 - 8) + 8,
      speed: Math.random() * (40 - 20) + 20,
      color: Math.random() > 0.5 ? '#f43f5e' : '#e0e0e0',
      direction: Math.random() * 360
    }));
  
    return (
      <div className="absolute inset-0 overflow-hidden">
        {indicators.map((indicator) => (
          <div
            key={indicator.id}
            className="absolute rounded-full shadow-lg animate-float"
            style={{
              left: `${indicator.x}%`,
              top: `${indicator.y}%`,
              width: `${indicator.size}px`,
              height: `${indicator.size}px`,
              backgroundColor: indicator.color,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: `float ${indicator.speed}s infinite linear`,
              transform: `rotate(${indicator.direction}deg)`,
            }}
          />
        ))}
      </div>
    );
  };

  export default FloatingIndicators;