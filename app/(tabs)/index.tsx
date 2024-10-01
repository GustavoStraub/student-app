import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../theme/colorPalette";
import { useFocusEffect, useRouter } from "expo-router";
import { flushSchedules, getAllSchedules, Schedule } from "../db/Schedules";
import { GPTScheduleResponse } from "../types/Schedule";

export default function Index() {
  const { push } = useRouter();

  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const loadSchedules = async () => {
    try {
      const allSchedules = await getAllSchedules();

      setSchedules(allSchedules);
    } catch (error) {
      console.error("Erro ao carregar cronogramas:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [])
  );

  const handleAddSchedule = () => {
    push("/(tabs)/form");
  };

  const renderItem = ({ item }: { item: Schedule }) => {
    const schedule: GPTScheduleResponse = JSON.parse(item.data);
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{schedule.notes}</Text>
        <Text style={styles.description}>
          {schedule.schedule.map((day) => {
            return `${day.day}: \n ${day.studySessions
              .map(
                (session) =>
                  `${session.subject} (${session.startTime} - ${session.endTime})`
              )
              .join("\n")}\n\n`;
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum cronograma encontrado.</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddSchedule}>
        <FontAwesome name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.flush} onPress={flushSchedules}>
        <Text>Flush</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  flush: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});
