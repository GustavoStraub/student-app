import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { colors } from "../theme/colorPalette";
import { FontAwesome } from "@expo/vector-icons";

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

const StudyScheduleForm = () => {
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

  const handleSubmit = () => {
    const userInput = {
      subjects,
      availability,
    };
    console.log(userInput);
    // here we will send the input for the AI

    setAvailability(initialAvailability);
    setSubjects([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cronograma de Estudos</Text>

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

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Criar Cronograma</Text>
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
