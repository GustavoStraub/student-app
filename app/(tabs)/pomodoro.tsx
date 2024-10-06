import React, { useState, useEffect } from "react";
import { Text, View, Button, StyleSheet } from "react-native";
import { colors } from "../theme/colorPalette";

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isRunning && (minutes > 0 || seconds > 0)) {
      timer = setInterval(() => {
        if (seconds === 0) {
          setMinutes((prev) => prev - 1);
          setSeconds(59);
        } else {
          setSeconds((prev) => prev - 1);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0) {
      clearInterval(timer);
      if (!onBreak) {
        setMinutes(5);
        setOnBreak(true);
      } else {
        setMinutes(25);
        setOnBreak(false);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, minutes, seconds]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setOnBreak(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>
        {minutes < 10 ? `0${minutes}` : minutes}:
        {seconds < 10 ? `0${seconds}` : seconds}
      </Text>
      <Text style={styles.statusText}>
        {onBreak ? "Intervalo" : "Trabalho"}
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleStartPause}
          title={isRunning ? "Pausar" : "Iniciar"}
          color={isRunning ? colors.error : colors.primary}
        />
        <Button
          onPress={handleReset}
          title="Resetar"
          color={colors.lightText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondaryBackground,
    padding: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.darkText,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 24,
    color: colors.lightText,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 20,
  },
});
