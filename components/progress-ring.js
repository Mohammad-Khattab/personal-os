export function drawProgressRing(canvas, percent, color = '#8b5cf6') {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2, cy = size / 2;
  const radius = (size / 2) - 10;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (2 * Math.PI * Math.min(percent, 100) / 100);

  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 8;
  ctx.stroke();

  if (percent > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}
