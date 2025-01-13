import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import FlipStyles from '@/styles';

export default function SignIn() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} />
      <Link href="/(auth)/signup"><Text>app/(tabs)/index.tsx</Text></Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FlipStyles.adjustScale(20),
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: FlipStyles.adjustScale(30),
    height: 1,
    width: '80%',
  },
});
