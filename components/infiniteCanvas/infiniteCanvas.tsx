import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { initCursorChat } from "cursor-chat";

import { TouchZoom } from "./touchZoom";
import { type infProps } from './infiniteDiv'


// higher order component that takes a component as an argument
// HOC is used to pass in props to the wrapped component in a type-safe way
const InfiniteCanvas = <P extends infProps>(
  roomName: string,
  WrappedComponent: React.ComponentType<P>
) => {
  const InfiniteCanvasComponent = (props: P) => {
    const [zoom, setZoom] = useState(1.0);
    // x and y mark the center of the frame
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const zoomRef = useRef(1.0);
    const xRef = useRef(0);
    const yRef = useRef(0);

    zoomRef.current = zoom;
    xRef.current = x;
    yRef.current = y;

    const ID = "frame";
    const triggerKey = "/";

    // mount touchzoom to the infinite canvas div
    // can change bounds in touchZoom.ts L59-L68
    useEffect(() => {
      let cleanup: () => void;
      let handleInfiniteCanvasMove: (
        arg0: number,
        arg1: number,
        arg2: number
      ) => void;
      try {
        const init = initCursorChat(
          roomName,
          () => xRef.current,
          () => yRef.current,
          () => zoomRef.current,
          triggerKey,
          ID
        );
        console.log(init);
        cleanup = init.cleanup;
        handleInfiniteCanvasMove = init.handleInfiniteCanvasMove;
      } catch (e) {
        console.log(e);
        return;
      }

      const frame = document.getElementById(ID) as HTMLDivElement;
      const newTZ = new TouchZoom(frame);
      newTZ.onMove((manual) => {
        setX(newTZ.center[0]);
        setY(newTZ.center[1]);
        setZoom(newTZ.zoom);
        // console.log(newTZ.center[0], newTZ.center[1]);
        handleInfiniteCanvasMove(newTZ.center[0], newTZ.center[1], newTZ.zoom);

        if (manual) {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }
      });
      return cleanup;
    }, []);
    
    return (
      <div 
        className='infinite-container'
        style={{ 
          backgroundColor: props.color ? props.color : undefined,
          backgroundImage: props.url ? `url(${props.url})` : undefined,
        }}
      >
        <div className='infinite-canvas' id={ID}>
          <div id="cursor-chat-box">
            <input type="text" id="cursor-chat-box-input" />
          </div>
          <WrappedComponent {...props} zoom={zoom} x={x} y={y} />
        </div>
      </div>
    );
  };
  return InfiniteCanvasComponent;
};

export default InfiniteCanvas;
