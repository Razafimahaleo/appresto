import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  subscribeToChatMessages,
  sendChatMessage,
  type ChatMessage as ChatMessageType,
  type ChatSender,
} from '../../services/firestore';
import { theme } from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = Math.min(Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.5, 400);
const HEADER_HEIGHT = 48;
const INPUT_ROW_HEIGHT = 60;
const LIST_HEIGHT = Math.max(180, MODAL_HEIGHT - HEADER_HEIGHT - INPUT_ROW_HEIGHT);

type ChatRouteParams = { sender: ChatSender };

export function ChatScreenWithRoute() {
  const route = useRoute<RouteProp<{ params: ChatRouteParams }, 'params'>>();
  const sender = route.params?.sender ?? 'chef';
  return <ChatScreen sender={sender} />;
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  sender: ChatSender;
}

export function ChatModal({ visible, onClose, sender }: ChatModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalBox, { height: MODAL_HEIGHT }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {sender === 'chef' ? 'Discussion avec la caissière' : 'Discussion avec le chef'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ChatScreen sender={sender} />
        </View>
      </View>
    </Modal>
  );
}

export function ChatFab({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.fabIcon}>💬</Text>
    </TouchableOpacity>
  );
}

function formatTime(date: Date | { seconds: number }) {
  const d = date instanceof Date ? date : new Date((date as { seconds: number }).seconds * 1000);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

interface ChatScreenProps {
  sender: ChatSender;
}

export default function ChatScreen({ sender }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    return subscribeToChatMessages(setMessages);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => scrollRef.current?.scrollToEnd({ animated: true }),
        150
      );
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      await sendChatMessage(sender, text);
    } finally {
      setSending(false);
    }
  };

  const otherLabel = sender === 'chef' ? 'Caissière' : 'Chef';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        style={[styles.listWrapper, { height: LIST_HEIGHT }]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        {messages.length === 0 ? (
          <Text style={styles.empty}>
            Aucun message. Démarrez la conversation avec {otherLabel}.
          </Text>
        ) : (
          messages.map((item) => {
            const isMe = item.sender === sender;
            return (
              <View
                key={item.id}
                style={[
                  styles.bubbleWrap,
                  isMe ? styles.bubbleWrapRight : styles.bubbleWrapLeft,
                ]}
              >
                {!isMe && (
                  <Text style={styles.senderLabel}>{otherLabel}</Text>
                )}
                <View
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleOther,
                  ]}
                >
                  <Text style={[styles.bubbleText, isMe && { color: '#fff' }]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.bubbleTime, isMe && { color: 'rgba(255,255,255,0.8)' }]}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Message..."
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendBtnText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  closeBtnText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  fabIcon: {
    fontSize: 24,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    minHeight: 0,
  },
  listWrapper: {},
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  bubbleWrap: {
    marginBottom: theme.spacing.sm,
    maxWidth: '85%',
  },
  bubbleWrapLeft: {
    alignSelf: 'flex-start',
  },
  bubbleWrapRight: {
    alignSelf: 'flex-end',
  },
  senderLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    marginLeft: theme.spacing.xs,
  },
  bubble: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    maxWidth: '100%',
  },
  bubbleMe: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  bubbleText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  bubbleTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
