import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from '@expo/vector-icons';

export default function MenuBottom({ navigation }) {

    function irParaTelaHome() {
        navigation.navigate("Home")
    }

    function irParaMinhaConta(){
        navigation.navigate('MinhaConta')
    }

    return (
        <View style={estilos.container}>
            <TouchableOpacity
                style={estilos.botaoMenu}
                onPress={irParaTelaHome}
            >
                <Feather name="home" size={24} color="#A020F0" />
                <Text style={estilos.textoBotao}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={estilos.botaoMenu}
                onPress={irParaMinhaConta}
            >
                <Feather name="user" size={24} color="#888" />
                <Text style={estilos.textoBotaoInativo}>Conta</Text>
            </TouchableOpacity>
        </View>
    )
}

const estilos = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        height: 75,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 10,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        elevation: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    botaoMenu: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        flex: 1,
    },
    textoBotao: {
        fontSize: 12,
        color: '#A020F0',
        marginTop: 4,
        fontWeight: 'bold',
    },
    textoBotaoInativo: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        fontWeight: '500',
    }
});