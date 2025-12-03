const Redis = require('ioredis');

async function testRedis() {
  console.log('🔍 Testando conexão com Redis...\n');

  const config = {
    host: '31.97.172.127',
    port: 3,
    password: 'Leo07102008@#@',
    username: 'default',
    retryStrategy: (times) => {
      if (times > 3) {
        return null; // stop retrying
      }
      return Math.min(times * 50, 2000);
    },
  };

  console.log('Configuração:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Username: ${config.username}`);
  console.log(`  Password: ${config.password}\n`);

  const redis = new Redis(config);

  redis.on('connect', () => {
    console.log('✅ Conectando ao Redis...');
  });

  redis.on('ready', async () => {
    console.log('✅ CONEXÃO REDIS BEM-SUCEDIDA!\n');

    try {
      // Testar comandos básicos
      console.log('📊 Testando comandos...');

      await redis.set('test:key', 'Hello Redis!');
      console.log('  ✓ SET test:key');

      const value = await redis.get('test:key');
      console.log(`  ✓ GET test:key = "${value}"`);

      await redis.del('test:key');
      console.log('  ✓ DEL test:key');

      // Info do servidor
      const info = await redis.info('server');
      const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
      console.log(`\n📋 Redis Version: ${version || 'unknown'}`);

      await redis.quit();
      console.log('\n✅ Teste concluído com sucesso!');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Erro ao executar comandos:', error.message);
      await redis.quit();
      process.exit(1);
    }
  });

  redis.on('error', (error) => {
    console.error('❌ ERRO DE CONEXÃO:', error.message);
    console.error('\nDetalhes:', error);
    process.exit(1);
  });

  // Timeout de 10 segundos
  setTimeout(() => {
    console.error('❌ Timeout: não foi possível conectar em 10 segundos');
    redis.disconnect();
    process.exit(1);
  }, 10000);
}

testRedis();
