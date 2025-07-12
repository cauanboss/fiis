// MongoDB Replica Set Initialization Script
print('🚀 Inicializando MongoDB Replica Set...');

// Aguardar um pouco para o MongoDB estar pronto
sleep(5000);

try {
    // Inicializar o replica set
    rs.initiate({
        _id: "rs0",
        members: [
            { _id: 0, host: "localhost:27017" }
        ]
    });

    print('✅ Replica set inicializado com sucesso!');
} catch (error) {
    print('❌ Erro ao inicializar replica set: ' + error.message);
}

// Aguardar o replica set estar pronto
sleep(3000);

// Verificar status do replica set
try {
    const status = rs.status();
    print('📊 Status do Replica Set:');
    print(JSON.stringify(status, null, 2));
} catch (error) {
    print('⚠️  Erro ao verificar status: ' + error.message);
} 