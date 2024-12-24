import React, { useState, useRef, useEffect } from 'react';
import { Square, Circle, Triangle, Star } from 'lucide-react';

const ZoomableWhiteboard = () => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const { deltaY } = event;
    const scaleChange = deltaY > 0 ? 0.9 : 1.1;
    
    if (!containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const cursorX = event.clientX - bounds.left;
    const cursorY = event.clientY - bounds.top;

    const newScale = transform.scale * scaleChange;
    
    const x = (cursorX - transform.x) / transform.scale;
    const y = (cursorY - transform.y) / transform.scale;
    
    const newX = cursorX - x * newScale;
    const newY = cursorY - y * newScale;

    setTransform({
      x: newX,
      y: newY,
      scale: newScale,
    });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return;
    setIsDragging(true);
    setLastPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = event.clientX - lastPosition.x;
    const dy = event.clientY - lastPosition.y;

    setTransform(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setLastPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="text-sm text-gray-600 mb-2">
        🖱️ Scroll to zoom, drag to pan
      </div>
      <div 
        ref={containerRef}
        className="w-full h-96 bg-blue-50 border-2 border-blue-200 overflow-hidden cursor-grab rounded-lg"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ 
          touchAction: 'none'
        }}
      >
        <div
          className="w-full h-full relative"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Grid background */}
          <div className="grid grid-cols-[repeat(50,40px)] grid-rows-[repeat(50,40px)] absolute inset-0">
            {Array.from({ length: 2500 }).map((_, i) => (
              <div
                key={i}
                className="border border-blue-100"
              />
            ))}
          </div>
          
          {/* Sample content */}
          <div className="absolute inset-0">
            {/* Shapes Group 1 */}
            <div className="absolute left-40 top-40 flex flex-col items-center">
              <Square className="text-blue-500" size={48} />
              <div className="mt-2 bg-white px-2 py-1 rounded shadow text-sm">
                Square
              </div>
            </div>

            {/* Shapes Group 2 */}
            <div className="absolute left-160 top-80 flex flex-col items-center">
              <Circle className="text-green-500" size={48} />
              <div className="mt-2 bg-white px-2 py-1 rounded shadow text-sm">
                Circle
              </div>
            </div>

            {/* Shapes Group 3 */}
            <div className="absolute left-280 top-40 flex flex-col items-center">
              <Triangle className="text-purple-500" size={48} />
              <div className="mt-2 bg-white px-2 py-1 rounded shadow text-sm">
                Triangle
              </div>
            </div>

            {/* Shapes Group 4 */}
            <div className="absolute left-400 top-80 flex flex-col items-center">
              <Star className="text-yellow-500" size={48} />
              <div className="mt-2 bg-white px-2 py-1 rounded shadow text-sm">
                Star
              </div>
            </div>

            {/* Text elements */}
            <div className="absolute left-200 top-200 bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800">Zoomable Whiteboard</h2>
              <p className="text-gray-600">Try zooming in and out!</p>
            </div>

            {/* Arrow */}
            <svg className="absolute left-300 top-160" width="100" height="100">
              <path
                d="M10,50 L90,50 M80,40 L90,50 L80,60"
                stroke="red"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomableWhiteboard;