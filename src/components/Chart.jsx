import React, { useRef, useEffect } from 'react';

const Chart = ({ type, data, width = 300, height = 200 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Basic styling
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    if (type === 'line') {
      drawLineChart(ctx, data, padding, chartWidth, chartHeight, height);
    } else if (type === 'bar') {
      drawBarChart(ctx, data, padding, chartWidth, chartHeight, height);
    } else if (type === 'donut') {
      drawDonutChart(ctx, data, width, height);
    }

  }, [type, data, width, height]);

  const drawLineChart = (ctx, data, padding, w, h, totalH) => {
    ctx.beginPath();
    ctx.strokeStyle = '#0B5B5B';
    ctx.lineWidth = 2;
    
    const maxVal = Math.max(...data);
    const stepX = w / (data.length - 1);
    
    data.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = totalH - padding - (val / maxVal) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      
      // Draw point
      ctx.fillStyle = '#D4A247';
      ctx.fillRect(x - 2, y - 2, 4, 4);
    });
    ctx.stroke();
    
    // Axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, totalH - padding);
    ctx.lineTo(padding + w, totalH - padding); // X
    ctx.moveTo(padding, totalH - padding);
    ctx.lineTo(padding, padding); // Y
    ctx.stroke();
  };

  const drawBarChart = (ctx, data, padding, w, h, totalH) => {
    const maxVal = Math.max(...data);
    const barWidth = (w / data.length) * 0.6;
    const gap = (w / data.length) * 0.4;
    
    data.forEach((val, i) => {
      const x = padding + i * (barWidth + gap) + gap / 2;
      const barH = (val / maxVal) * h;
      const y = totalH - padding - barH;
      
      ctx.fillStyle = '#0B5B5B';
      ctx.fillRect(x, y, barWidth, barH);
    });
    
    // Axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, totalH - padding);
    ctx.lineTo(padding + w, totalH - padding);
    ctx.stroke();
  };

  const drawDonutChart = (ctx, data, w, h) => {
    const total = data.reduce((a, b) => a + b, 0);
    let startAngle = 0;
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) / 2 - 10;
    const colors = ['#0B5B5B', '#D4A247', '#E5E7EB'];
    
    data.forEach((val, i) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      startAngle += sliceAngle;
    });
    
    // Cutout
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  };

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default Chart;
