import React, { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";

interface QueueState {
  data: (number | null)[];
  front: number;
  rear: number;
  size: number;
  maxSize: number;
}

const QueueSimulator: React.FC = () => {
  const [queueState, setQueueState] = useState<QueueState>({
    data: [],
    front: 0,
    rear: -1,
    size: 0,
    maxSize: 0,
  });
  
  const [inputValue, setInputValue] = useState<string>('');
  const [queueSize, setQueueSize] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Set queue size to begin');
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initializeQueue = useCallback(() => {
    const size = parseInt(queueSize);
    if (isNaN(size) || size <= 0 || size > 20) {
      setStatusMessage('Please enter a valid size (1-20)');
      return;
    }
    
    setQueueState({
      data: new Array(size).fill(null),
      front: 0,
      rear: -1,
      size: 0,
      maxSize: size,
    });
    setIsInitialized(true);
    setStatusMessage(`Queue initialized with size ${size}`);
  }, [queueSize]);

  const enqueue = useCallback(() => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setStatusMessage('Please enter a valid number');
      return;
    }
    
    if (queueState.size >= queueState.maxSize) {
      setStatusMessage('Queue is full! Cannot enqueue.');
      return;
    }

    const newRear = (queueState.rear + 1) % queueState.maxSize;
    const newData = [...queueState.data];
    newData[newRear] = value;
    
    setAnimatingIndex(newRear);
    setQueueState({
      ...queueState,
      data: newData,
      rear: newRear,
      size: queueState.size + 1,
    });
    
    setInputValue('');
    setStatusMessage(`Enqueued ${value} at position ${newRear}`);
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setAnimatingIndex(null);
    }, 400);
  }, [inputValue, queueState]);

  const dequeue = useCallback(() => {
    if (queueState.size === 0) {
      setStatusMessage('Queue is empty! Cannot dequeue.');
      return;
    }

    const dequeuedValue = queueState.data[queueState.front];
    const newData = [...queueState.data];
    newData[queueState.front] = null;
    
    setAnimatingIndex(queueState.front);
    
    setTimeout(() => {
      const newFront = (queueState.front + 1) % queueState.maxSize;
      setQueueState({
        ...queueState,
        data: newData,
        front: newFront,
        size: queueState.size - 1,
      });
      setStatusMessage(`Dequeued ${dequeuedValue} from front`);
      setAnimatingIndex(null);
    }, 300);
  }, [queueState]);

  const getFront = useCallback(() => {
    if (queueState.size === 0) {
      setStatusMessage('Queue is empty! No front element.');
      return;
    }
    setStatusMessage(`Front element: ${queueState.data[queueState.front]}`);
  }, [queueState]);

  const getRear = useCallback(() => {
    if (queueState.size === 0) {
      setStatusMessage('Queue is empty! No rear element.');
      return;
    }
    setStatusMessage(`Rear element: ${queueState.data[queueState.rear]}`);
  }, [queueState]);

  const checkIsEmpty = useCallback(() => {
    const isEmpty = queueState.size === 0;
    setStatusMessage(`Queue is ${isEmpty ? 'empty' : 'not empty'}`);
  }, [queueState]);

  const checkIsFull = useCallback(() => {
    const isFull = queueState.size >= queueState.maxSize;
    setStatusMessage(`Queue is ${isFull ? 'full' : 'not full'}`);
  }, [queueState]);

  const showSize = useCallback(() => {
    setStatusMessage(`Current size: ${queueState.size}/${queueState.maxSize}`);
  }, [queueState]);

  const resetQueue = useCallback(() => {
    setQueueState({
      data: [],
      front: 0,
      rear: -1,
      size: 0,
      maxSize: 0,
    });
    setIsInitialized(false);
    setInputValue('');
    setQueueSize('');
    setStatusMessage('Set queue size to begin');
    setAnimatingIndex(null);
  }, []);

  const goBack = useCallback(() => {
    // In a real app, this would navigate back to the main page
    setStatusMessage('Returning to Virtual Lab...');
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={goBack}
            className="flex items-center gap-2 border-border hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lab
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground">
            Queue Data Structure Simulator
          </h1>
          
          <Button 
            variant="outline" 
            onClick={resetQueue}
            className="flex items-center gap-2 border-border hover:bg-secondary"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Queue Size Setup */}
        {!isInitialized && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-card to-secondary shadow-lg">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-card-foreground">
                Initialize Queue
              </h2>
              <div className="flex items-center justify-center gap-4">
                <Input
                  type="number"
                  placeholder="Enter queue size (1-20)"
                  value={queueSize}
                  onChange={(e) => setQueueSize(e.target.value)}
                  className="w-48 bg-background border-border"
                  min="1"
                  max="20"
                />
                <Button 
                  onClick={initializeQueue}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  Create Queue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Queue Visualization */}
        {isInitialized && (
          <>
            {/* Pointers */}
            <div className="mb-4">
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="w-16 h-8 bg-queue-front rounded-lg flex items-center justify-center text-white font-bold mb-2 shadow-lg animate-pulse-glow">
                    FRONT
                  </div>
                  <div className="text-sm text-muted-foreground">Index: {queueState.front}</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-8 bg-queue-rear rounded-lg flex items-center justify-center text-white font-bold mb-2 shadow-lg animate-pulse-glow">
                    REAR
                  </div>
                  <div className="text-sm text-muted-foreground">Index: {queueState.rear}</div>
                </div>
              </div>
            </div>

            {/* Queue Cells */}
            <Card className="p-6 mb-6 bg-gradient-to-br from-card to-secondary shadow-xl">
              <div className="flex justify-center items-center gap-2 mb-4">
                {queueState.data.map((value, index) => (
                  <div key={index} className="relative">
                    {/* Cell */}
                    <div
                      className={cn(
                        "w-16 h-16 border-2 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300",
                        value !== null ? "bg-queue-filled border-queue-pointer text-white shadow-md" : "bg-queue-cell border-border text-muted-foreground",
                        index === queueState.front && queueState.size > 0 ? "ring-2 ring-queue-front ring-opacity-60" : "",
                        index === queueState.rear && queueState.size > 0 ? "ring-2 ring-queue-rear ring-opacity-60" : "",
                        animatingIndex === index ? 
                          (value !== null ? "animate-queue-enqueue" : "animate-queue-dequeue") : "",
                        "hover:bg-queue-hover"
                      )}
                    >
                      {value !== null ? value : '-'}
                    </div>
                    
                    {/* Index labels */}
                    <div className="text-xs text-muted-foreground text-center mt-1">
                      {index}
                    </div>
                    
                    {/* Front/Rear indicators */}
                    {index === queueState.front && queueState.size > 0 && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-queue-front">
                        F
                      </div>
                    )}
                    {index === queueState.rear && queueState.size > 0 && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-queue-rear">
                        R
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Status Display */}
              <div className="text-center">
                <div className="inline-block px-4 py-2 bg-secondary rounded-lg text-foreground font-medium">
                  {statusMessage}
                </div>
              </div>
            </Card>

            {/* Controls */}
            <div className="space-y-6">
              {/* Enqueue Section */}
              <Card className="p-4 bg-gradient-to-r from-card to-secondary shadow-lg">
                <div className="flex items-center justify-center gap-4">
                  <Input
                    type="number"
                    placeholder="Enter value to enqueue"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-48 bg-background border-border"
                    disabled={queueState.size >= queueState.maxSize}
                  />
                  <Button 
                    onClick={enqueue}
                    disabled={queueState.size >= queueState.maxSize || !inputValue}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg disabled:opacity-50"
                  >
                    Enqueue
                  </Button>
                </div>
              </Card>

              {/* Operation Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Button 
                  onClick={dequeue}
                  disabled={queueState.size === 0}
                  variant="destructive"
                  className="shadow-lg"
                >
                  Dequeue
                </Button>
                
                <Button 
                  onClick={getFront}
                  disabled={queueState.size === 0}
                  className="bg-gradient-to-r from-queue-front to-queue-front/80 text-white shadow-lg"
                >
                  Get Front
                </Button>
                
                <Button 
                  onClick={getRear}
                  disabled={queueState.size === 0}
                  className="bg-gradient-to-r from-queue-rear to-queue-rear/80 text-white shadow-lg"
                >
                  Get Rear
                </Button>
                
                <Button 
                  onClick={checkIsEmpty}
                  variant="outline"
                  className="border-border hover:bg-secondary shadow-lg"
                >
                  Is Empty?
                </Button>
                
                <Button 
                  onClick={checkIsFull}
                  variant="outline"
                  className="border-border hover:bg-secondary shadow-lg"
                >
                  Is Full?
                </Button>
                
                <Button 
                  onClick={showSize}
                  variant="outline" 
                  className="border-border hover:bg-secondary shadow-lg"
                >
                  Show Size
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QueueSimulator;