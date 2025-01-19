import { StyleSheet, View } from 'react-native';

import FlipStyles from '@/styles';
import FormInput from '@/components/base/TextInput/FormTextInput';
import { useState } from 'react';
import { useFlipTheme } from '@/common';

export default function SignIn() {
  const theme = useFlipTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <View style={[styles.container,{
      backgroundColor:theme.white
    }]}>      
      <View style={styles.wrapper}>
        <FormInput style={styles.textInput} placeholder='example@flipsync.co.kr'  value={email} onChangeText={(v)=>setEmail(v)}  label='아이디' />
        <FormInput style={styles.textInput} placeholder='영문, 숫자 8자리' value={password} onChangeText={(v)=>setPassword(v)} label='비밀번호' secureTextEntry  />          
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper:{
    width:'100%',
    paddingHorizontal:FlipStyles.adjustScale(24),
  },
  textInput: {
    flex: 1,
    fontSize: FlipStyles.adjustScale(17),
    lineHeight: FlipStyles.adjustScale(22),
  },

});
