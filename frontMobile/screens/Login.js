import { Button, Text, TextInput, View } from "react-native";

export default function Login(){
    return(
        <View>
            <Text>Bem vindo ao Sistema</Text>

            <Text>Email</Text>
            <TextInput placeholder="Digite seu email"></TextInput>
            <Text>Senha</Text>
            <TextInput type="password" placeholder="Digite sua senha"></TextInput>
            <Button
                title="Realizar Login"
            />

            <Text>Novo no sistema?</Text>
            <Button
                title="Cadastrar-se"
            />
        </View>
    )
}