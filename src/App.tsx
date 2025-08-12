import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';

// Improved single-file React Native app for Expo.
// Fixes and safeguards compared to previous version:
// - More robust timer logic in CallScreen
// - Guards for missing route params
// - Minor defensive checks and clearer keyboardType
// - Meant to be copied into App.js of an Expo project

const MOCK_CONTACTS = [
  { id: '1', name: 'Alice Chen1', number: '+81 90 1111 2222' },
  { id: '2', name: 'Bob Tanaka', number: '+81 80 3333 4444' },
  { id: '3', name: 'Carol Sato', number: '+81 70 5555 6666' },
  { id: '4', name: 'David Liu', number: '+81 90 7777 8888' },
];

export default function App() {
  const [route, setRoute] = useState({ name: 'Dialer', params: {} });
  const [dialNumber, setDialNumber] = useState('');
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [callLog, setCallLog] = useState([]); // {id,name,number,type,time}

  // navigation helpers
  const navTo = (name, params = {}) => setRoute({ name, params });

  const onPlaceCall = ({ name, number }) => {
    if (!number) return;
    // add to call log
    const now = new Date();
    const entry = {
      id: String(now.getTime()),
      name: name || number,
      number,
      type: 'outgoing',
      time: now.toISOString(),
    };
    setCallLog((prev) => [entry, ...prev]);

    // navigate to call screen
    navTo('CallScreen', { call: entry });
  };

  const Header = ({ title }) => (
    <View style={styles.header}>
      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      <View style={styles.headerRight} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {route.name === 'Dialer' && (
        <>
          <Header title="Dialer" />
          <Dialer
            dialNumber={dialNumber}
            setDialNumber={setDialNumber}
            onCall={() => onPlaceCall({ number: dialNumber })}
            onClear={() => setDialNumber('')}
            onDelete={() => setDialNumber((s) => s.slice(0, -1))}
          />

          <View style={styles.bottomTabs}>
            <Tab label="Contacts" onPress={() => navTo('Contacts')} />
            <Tab label="Call Log" onPress={() => navTo('CallLog')} />
          </View>
        </>
      )}

      {route.name === 'Contacts' && (
        <>
          <Header title="Contacts" />
          <Contacts
            contacts={contacts}
            onCall={(c) => onPlaceCall(c)}
            onBack={() => navTo('Dialer')}
          />
          <View style={styles.bottomTabs}>
            <Tab label="Dialer" onPress={() => navTo('Dialer')} />
            <Tab label="Call Log" onPress={() => navTo('CallLog')} />
          </View>
        </>
      )}

      {route.name === 'CallLog' && (
        <>
          <Header title="Call Log" />
          <CallLog
            logs={callLog}
            onCall={(entry) => onPlaceCall({ name: entry.name, number: entry.number })}
            onBack={() => navTo('Dialer')}
          />
          <View style={styles.bottomTabs}>
            <Tab label="Dialer" onPress={() => navTo('Dialer')} />
            <Tab label="Contacts" onPress={() => navTo('Contacts')} />
          </View>
        </>
      )}

      {route.name === 'CallScreen' && (
        <>
          <Header title={`Calling ${route.params?.call?.name || route.params?.call?.number || ''}`} />
          <CallScreen
            call={route.params?.call}
            onEnd={() => navTo('Dialer')}
          />
        </>
      )}
    </SafeAreaView>
  );
}

function Dialer({ dialNumber, setDialNumber, onCall, onClear, onDelete }) {
  const keys = [
    ['1', ''],
    ['2', 'ABC'],
    ['3', 'DEF'],
    ['4', 'GHI'],
    ['5', 'JKL'],
    ['6', 'MNO'],
    ['7', 'PQRS'],
    ['8', 'TUV'],
    ['9', 'WXYZ'],
    ['*', ''],
    ['0', '+'],
    ['#', ''],
  ];

  const handlePress = (d) => setDialNumber((p) => p + d);

  return (
    <View style={styles.flex}>
      <View style={styles.display}>
        <TextInput
          style={styles.input}
          value={dialNumber}
          onChangeText={setDialNumber}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'phone-pad'}
          placeholder="Enter number"
        />
      </View>

      <View style={styles.pad}>
        {keys.map(([k, sub], i) => (
          <TouchableOpacity
            key={`${k}-${i}`}
            style={styles.key}
            onPress={() => handlePress(k)}
            activeOpacity={0.7}
          >
            <Text style={styles.keyLabel}>{k}</Text>
            {sub ? <Text style={styles.keySub}>{sub}</Text> : <View />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.callBtn, { backgroundColor: dialNumber ? '#0a84ff' : '#9bbcfb' }]}
          onPress={onCall}
          disabled={!dialNumber}
        >
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onClear}>
          <Text style={styles.actionText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Contacts({ contacts, onCall }) {
  return (
    <View style={styles.flex}>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactNumber}>{item.number}</Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => onCall(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.smallBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
}

function CallLog({ logs, onCall }) {
  if (!logs || logs.length === 0) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={{ color: '#666' }}>No call history yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={logs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.logRow}
          onPress={() => onCall(item)}
          activeOpacity={0.7}
        >
          <View>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactNumber}>{formatTime(item.time)}</Text>
          </View>
          <View style={styles.logTypeWrap}>
            <Text style={styles.logType}>{item.type}</Text>
          </View>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
    />
  );
}

function CallScreen({ call, onEnd }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [running]);

  useEffect(() => {
    // reset timer when a new call starts
    setSeconds(0);
    setRunning(true);
  }, [call?.id]);

  if (!call) return (
    <View style={[styles.flex, styles.center]}>
      <Text>Missing call data</Text>
    </View>
  );

  return (
    <View style={[styles.flex, styles.center]}>
      <Text style={styles.callName}>{call.name}</Text>
      <Text style={styles.callNumber}>{call.number}</Text>
      <Text style={styles.timer}>{formatDuration(seconds)}</Text>

      <View style={styles.callActions}>
        <TouchableOpacity
          style={[styles.callActionBtn, { backgroundColor: '#3b3b3b' }]}
          onPress={() => setRunning((r) => !r)}
        >
          <Text style={styles.callActionText}>{running ? 'Pause' : 'Resume'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.callActionBtn, { backgroundColor: '#e53935' }]} onPress={onEnd}>
          <Text style={styles.callActionText}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Tab({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.tabText}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatDuration(s) {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  header: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerRight: { width: 44 },
  display: { padding: 16, alignItems: 'center' },
  input: { fontSize: 28, padding: 8, minWidth: 200, textAlign: 'center' },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  key: {
    width: '30%',
    aspectRatio: 1,
    marginVertical: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: { fontSize: 24, fontWeight: '700' },
  keySub: { fontSize: 11, color: '#666' },
  actions: { flexDirection: 'row', justifyContent: 'space-around', padding: 12 },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  actionText: { fontSize: 16 },
  callBtn: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottomTabs: {
    height: 56,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    flexDirection: 'row',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 16 },
  contactRow: { flexDirection: 'row', padding: 14, justifyContent: 'space-between', alignItems: 'center' },
  contactName: { fontSize: 16, fontWeight: '600' },
  contactNumber: { fontSize: 13, color: '#666', marginTop: 4 },
  contactActions: { flexDirection: 'row' },
  smallBtn: { backgroundColor: '#0a84ff', padding: 8, borderRadius: 6 },
  smallBtnText: { color: '#fff', fontWeight: '600' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee' },
  center: { alignItems: 'center', justifyContent: 'center' },
  logRow: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logTypeWrap: { backgroundColor: '#f0f0f0', padding: 6, borderRadius: 6 },
  logType: { fontSize: 12, color: '#333' },
  callName: { fontSize: 22, fontWeight: '700', marginTop: 40 },
  callNumber: { fontSize: 16, color: '#666', marginTop: 8 },
  timer: { fontSize: 28, marginTop: 18 },
  callActions: { flexDirection: 'row', marginTop: 30 },
  callActionBtn: { padding: 14, borderRadius: 40, marginHorizontal: 12 },
  callActionText: { color: '#fff', fontWeight: '700' },
});

