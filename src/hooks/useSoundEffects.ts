"use client";

import { useCallback, useRef, useEffect } from "react";

// Sound effect types
type SoundEffect = "click" | "success" | "error" | "notify" | "type" | "send" | "complete";

// Base64 encoded simple sound effects (generated programmatically)
const SOUND_DATA: Record<SoundEffect, string> = {
  click: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQEAnPbl1J0MAHW23NWiOwB9utnSq0YAjMPd2KBIAI7F4dqhVgCRyOXdrFoAmM3m4bBnAJ7Q6OW+cgCh1O/pwnwAp9fw8aaLAanV9PqnjgGo1fT7ypIBqdX0+8qSAQ==",
  success: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQEAnPbl1J0MAHW23NWiOwB9utnSq0YAjMPd2KBIAI7F4dqhVgCRyOXdrFoAmM3m4bBnAJ7Q6OW+cgCh1O/pwnwAp9fw8aaLAanV9PqnjgGo1fT7ypIBqdX0+8qSAQ==",
  error: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQEAnPbl1J0MAHW23NWiOwB9utnSq0YAjMPd2KBIAI7F4dqhVgCRyOXdrFoAmM3m4bBnAJ7Q6OW+cgCh1O/pwnwAp9fw8aaLAanV9PqnjgGo1fT7ypIBqdX0+8qSAQ==",
  notify: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQEAnPbl1J0MAHW23NWiOwB9utnSq0YAjMPd2KBIAI7F4dqhVgCRyOXdrFoAmM3m4bBnAJ7Q6OW+cgCh1O/pwnwAp9fw8aaLAanV9PqnjgGo1fT7ypIBqdX0+8qSAQ==",
  type: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQEAnPbl1J0MAHW23NWiOwB9utnSq0YAjMPd2KBIAI7F4dqhVgCRyOXdrFoAmM3m4bBnAJ7Q6OW+cgCh1O/pwnwAp9fw8aaLAanV9PqnjgGo1fT7ypIBqdX0+8qSAQ==",
  send: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQEAnPbl1J0MAHW23NWiOwB9utnSq0YAjMPd2KBIAI7F4dqhVgCRyOXdrFoAmM3m4bBnAJ7Q6OW+cgCh1O/pwnwAp9fw8aaLAanV9PqnjgGo1fT7ypIBqdX0+8qSAQ==",
  complete: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQEAnPbl1J0MAHW23NWiOwB9utnSq0YAjMPd2KBIAI7F4dqhVgCRyOXdrFoAmM3m4bBnAJ7Q6OW+cgCh1O/pwnwAp9fw8aaLAanV9PqnjgGo1fT7ypIBqdX0+8qSAQ==",
};

// Check if sounds are enabled
function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("agent-town:sounds");
  return stored !== "false";
}

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(isSoundEnabled());

  // Initialize AudioContext on first user interaction
  useEffect(() => {
    const handleClick = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
    };

    document.addEventListener("click", handleClick, { once: true });
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Play a sound effect
  const playSound = useCallback((effect: SoundEffect) => {
    if (!enabledRef.current) return;

    try {
      // Create audio element for simple playback
      const audio = new Audio(SOUND_DATA[effect]);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch {
      // Ignore errors
    }
  }, []);

  // Toggle sound effects
  const toggleSound = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    localStorage.setItem("agent-town:sounds", String(enabledRef.current));
    return enabledRef.current;
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    localStorage.setItem("agent-town:sound-volume", String(clamped));
  }, []);

  return {
    playSound,
    toggleSound,
    setVolume,
    isEnabled: enabledRef.current,
  };
}

// Simple hook for click sounds
export function useClickSound() {
  const { playSound } = useSoundEffects();
  return useCallback(() => playSound("click"), [playSound]);
}

// Simple hook for success sounds
export function useSuccessSound() {
  const { playSound } = useSoundEffects();
  return useCallback(() => playSound("success"), [playSound]);
}

// Simple hook for error sounds
export function useErrorSound() {
  const { playSound } = useSoundEffects();
  return useCallback(() => playSound("error"), [playSound]);
}
