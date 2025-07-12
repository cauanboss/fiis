#!/usr/bin/env bun

import { main } from '../index.js';

async function testInfrastructure() {
  console.log('🧪 Testando arquivo infrastructure/index.ts...\n');
  
  try {
    await main();
    console.log('\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro no teste:', error);
  }
}

testInfrastructure(); 