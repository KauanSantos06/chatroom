import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { useMyProfile, useUpdateUsername } from '@/hooks/useMyProfile';
import { colors, spacing } from '@/theme';
import { friendlyError } from '@/utils/errors';
export default function ProfileScreen() {
  const { user, signOut } = useAuth(); const { data: profile } = useMyProfile(); const updateUsername = useUpdateUsername();
  const [editing, setEditing] = useState(false); const [name, setName] = useState('');
  function startEditing() { setName(profile?.username ?? ''); setEditing(true); }
  function save() {
    const trimmed = name.trim();
    if (trimmed.length < 2) { Alert.alert('Nome muito curto', 'Use pelo menos 2 caracteres.'); return; }
    updateUsername.mutate(trimmed, { onSuccess: () => setEditing(false), onError: (e) => Alert.alert('Não foi possível salvar', friendlyError(e)) });
  }
  function confirmSignOut() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: () => signOut().catch((e) => Alert.alert('Erro', friendlyError(e))) }]);
  }
  return (
    <Screen scroll>
      <Text style={styles.title}>Perfil</Text>
      <Card style={styles.card}>
        {profile ? <Avatar username={profile.username} color={profile.avatarColor} size={72} /> : null}
        <Text style={styles.username}>{profile?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </Card>
      <Card style={styles.card}>
        {editing ? (
          <View>
            <Input label="Nome de exibição" value={name} onChangeText={setName} placeholder="Seu nome" autoFocus />
            <View style={styles.row}><Button title="Cancelar" variant="secondary" onPress={() => setEditing(false)} style={styles.flex} /><Button title="Salvar" onPress={save} loading={updateUsername.isPending} style={styles.flex} /></View>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>Nome de exibição</Text>
            <Text style={styles.value}>{profile?.username}</Text>
            <Button title="Editar nome" variant="secondary" onPress={startEditing} style={styles.gap} />
          </View>
        )}
      </Card>
      <Button title="Sair da conta" variant="danger" onPress={confirmSignOut} />
    </Screen>
  );
}
const styles = StyleSheet.create({ title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: spacing.md }, card: { alignItems: 'center', gap: spacing.sm, padding: spacing.lg, marginBottom: spacing.md }, username: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.sm }, email: { fontSize: 14, color: colors.muted }, row: { flexDirection: 'row', gap: spacing.sm }, flex: { flex: 1 }, label: { fontSize: 14, fontWeight: '600', color: colors.muted }, value: { fontSize: 16, color: colors.text, marginTop: 4, marginBottom: spacing.md }, gap: { marginTop: spacing.sm } });
