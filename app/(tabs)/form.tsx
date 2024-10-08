import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { colors } from "../theme/colorPalette";
import { FontAwesome } from "@expo/vector-icons";
import { insertSchedule } from "../db/Schedules";
import { sendToOpenAI } from "../helpers/createSchedule";
import { useRouter } from "expo-router";

type Subject = {
  name: string;
  difficulty: number;
};

type Availability = {
  start: string;
  end: string;
};

type WeekAvailability = {
  monday: Availability;
  tuesday: Availability;
  wednesday: Availability;
  thursday: Availability;
  friday: Availability;
  saturday: Availability;
  sunday: Availability;
};

const initialAvailability: WeekAvailability = {
  monday: { start: "00:00", end: "00:00" },
  tuesday: { start: "00:00", end: "00:00" },
  wednesday: { start: "00:00", end: "00:00" },
  thursday: { start: "00:00", end: "00:00" },
  friday: { start: "00:00", end: "00:00" },
  saturday: { start: "00:00", end: "00:00" },
  sunday: { start: "00:00", end: "00:00" },
};

const dayLabels: { [key in keyof WeekAvailability]: string } = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const initialScheduleName = "Meu Cronograma";

const StudyScheduleForm = () => {
  const [scheduleName, setScheduleName] = useState(initialScheduleName);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject>({
    name: "",
    difficulty: 1,
  });
  const [availability, setAvailability] =
    useState<WeekAvailability>(initialAvailability);
  const [showPicker, setShowPicker] = useState<{ [key: string]: boolean }>({});
  const [selectedDay, setSelectedDay] = useState<keyof WeekAvailability | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<"start" | "end">("start");
  const [isLoading, setIsLoading] = useState(false);

  const { push } = useRouter();

  const addSubject = () => {
    if (currentSubject.name) {
      setSubjects([...subjects, currentSubject]);
      setCurrentSubject({ name: "", difficulty: 1 });
    }
  };

  const removeSubject = (index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects);
  };

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === "set" && selectedDate && selectedDay) {
      const time = selectedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setAvailability({
        ...availability,
        [selectedDay]: {
          ...availability[selectedDay],
          [selectedType]: time,
        },
      });
    }
    setShowPicker({ [selectedDay || ""]: false });
  };

  const showTimePicker = (
    day: keyof WeekAvailability,
    type: "start" | "end"
  ) => {
    setSelectedDay(day);
    setSelectedType(type);
    setShowPicker({ [day]: true });
  };

  const validateTime = (start: string, end: string): boolean => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    if (startHour > endHour) return false;
    if (startHour === endHour && startMinute >= endMinute) return false;
    return true;
  };

  const validateForm = (): boolean => {
    if (subjects.length === 0) {
      Alert.alert("Erro", "Você precisa adicionar pelo menos uma matéria.");
      return false;
    }

    const hasAvailableDay = Object.values(availability).some(
      (day) => day.start !== "00:00" || day.end !== "00:00"
    );
    if (!hasAvailableDay) {
      Alert.alert(
        "Erro",
        "Você precisa definir a disponibilidade em pelo menos um dia."
      );
      return false;
    }

    for (const [day, times] of Object.entries(availability)) {
      if (
        times.start !== "00:00" &&
        times.end !== "00:00" &&
        !validateTime(times.start, times.end)
      ) {
        Alert.alert(
          "Erro",
          `O horário de início deve ser antes do horário de fim em ${
            dayLabels[day as keyof WeekAvailability]
          }`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const scheduleData = {
        user: { name: "student" },
        subjects,
        availability: Object.fromEntries(
          Object.entries(availability).filter(
            ([_, times]) => !(times.start === "00:00" && times.end === "00:00")
          )
        ),
      };

      const response: any = await sendToOpenAI(scheduleData);

      if (response && response.choices[0]?.message?.content) {
        const gptScheduleContent = response.choices[0].message.content;

        try {
          const parsedSchedule = JSON.parse(gptScheduleContent);
          console.log("Valid response:", parsedSchedule);

          await insertSchedule(scheduleName, gptScheduleContent);
          console.log("Schedule saved!");

          setAvailability(initialAvailability);
          setSubjects([]);
          push("/(tabs)/");
        } catch (jsonError) {
          console.error("Invalid response:", jsonError);
        }
      } else {
        console.error("Invalid AI response:", response);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.subtitle}>Nome do cronograma</Text>

        <TextInput
          style={styles.input}
          placeholder={initialScheduleName}
          value={scheduleName}
          onChangeText={setScheduleName}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Adicionar Matéria</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome da matéria"
          value={currentSubject.name}
          onChangeText={(text) =>
            setCurrentSubject({ ...currentSubject, name: text })
          }
        />

        <Picker
          selectedValue={currentSubject.difficulty}
          style={styles.picker}
          onValueChange={(itemValue) =>
            setCurrentSubject({ ...currentSubject, difficulty: itemValue })
          }
        >
          <Picker.Item label="Dificuldade: 1" value={1} />
          <Picker.Item label="Dificuldade: 2" value={2} />
          <Picker.Item label="Dificuldade: 3" value={3} />
          <Picker.Item label="Dificuldade: 4" value={4} />
          <Picker.Item label="Dificuldade: 5" value={5} />
        </Picker>

        <TouchableOpacity style={styles.addButton} onPress={addSubject}>
          <Text style={styles.addButtonText}>Adicionar Matéria</Text>
        </TouchableOpacity>
        {subjects.length > 0 && (
          <View style={styles.subjectList}>
            <Text style={styles.subtitle}>Matérias Adicionadas</Text>
            {subjects.map((subject, index) => (
              <View key={index} style={styles.subjectItem}>
                <Text>
                  {subject.name} (Dificuldade: {subject.difficulty})
                </Text>
                <TouchableOpacity onPress={() => removeSubject(index)}>
                  <FontAwesome name="trash" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Horários Disponíveis</Text>
        <Text style={styles.note}>
          *Caso não tenha disponibilidade no dia, deixe o horario de inicio e
          fim como "00:00"
        </Text>
        {Object.keys(availability).map((day) => (
          <View key={day} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>
              {dayLabels[day as keyof WeekAvailability]}
            </Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() =>
                showTimePicker(day as keyof WeekAvailability, "start")
              }
            >
              <Text style={styles.timeText}>
                Início: {availability[day as keyof WeekAvailability].start}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() =>
                showTimePicker(day as keyof WeekAvailability, "end")
              }
            >
              <Text style={styles.timeText}>
                Fim: {availability[day as keyof WeekAvailability].end}
              </Text>
            </TouchableOpacity>
            {showPicker[day as keyof WeekAvailability] && (
              <DateTimePicker
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                value={new Date()}
                onChange={handleTimeChange}
                is24Hour={true}
              />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>Criar Cronograma</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.secondaryBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.darkText,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.darkText,
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    color: colors.darkText,
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightText,
    width: "100%",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  subjectList: {
    marginTop: 10,
  },
  subjectItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightText,
  },
  dayContainer: {
    marginBottom: 15,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.darkText,
    marginBottom: 5,
  },
  timePickerButton: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.lightText,
    marginBottom: 10,
  },
  timeText: {
    color: colors.darkText,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
});

export default StudyScheduleForm;
