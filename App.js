import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [datetime, setDatetime] = useState('');
  const [location, setLocation] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const saveTasks = async (tasksToSave) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(tasksToSave));
  };

  const loadTasks = async () => {
    const saved = await AsyncStorage.getItem('tasks');
    if (saved) setTasks(JSON.parse(saved));
  };

  const addTask = () => {
    if (!title || !datetime || !location) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      datetime,
      location,
      status: 'Pending',
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setTitle('');
    setDescription('');
    setDatetime('');
    setLocation('');
  };

  const deleteTask = (id) => {
    const updated = tasks.filter((task) => task.id !== id);
    setTasks(updated);
    saveTasks(updated);
    setModalVisible(false);
  };

  const updateStatus = (id, newStatus) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, status: newStatus } : task
    );
    setTasks(updated);
    saveTasks(updated);
    setModalVisible(false);
  };

  const TaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => {
        setSelectedTask(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskText}>🗓 {item.datetime}</Text>
      <Text style={styles.taskText}>📍 {item.location}</Text>
      <Text style={styles.status}>⏱ {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚀 Task Manager (Web3 Style)</Text>

      <TextInput placeholder="Task" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Description" style={styles.input} value={description} onChangeText={setDescription} />
      <TextInput placeholder="Date & Time (e.g. 2025-04-25 14:00)" style={styles.input} value={datetime} onChangeText={setDatetime} />
      <TextInput placeholder="Location" style={styles.input} value={location} onChangeText={setLocation} />
      <Button title="Add Task" onPress={addTask} color="#6C63FF" />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={TaskItem}
        style={{ marginTop: 20 }}
      />

      {selectedTask && (
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedTask.title}</Text>
            <Text>{selectedTask.description}</Text>
            <Text>📅 {selectedTask.datetime}</Text>
            <Text>📍 {selectedTask.location}</Text>
            <Text>Status: {selectedTask.status}</Text>

            <View style={styles.modalButtons}>
              <Button title="In Progress" onPress={() => updateStatus(selectedTask.id, 'In Progress')} />
              <Button title="Completed" onPress={() => updateStatus(selectedTask.id, 'Completed')} />
              <Button title="Cancelled" onPress={() => updateStatus(selectedTask.id, 'Cancelled')} />
              <Button title="Delete" color="red" onPress={() => deleteTask(selectedTask.id)} />
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#1a1a2e' },
  header: { fontSize: 24, color: '#6C63FF', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  input: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  taskItem: {
    backgroundColor: '#292f3f',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  taskText: { color: '#ccc' },
  status: { color: '#00f0ff', marginTop: 5 },
  modalView: {
    margin: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalButtons: { marginTop: 10, gap: 5 },
});
