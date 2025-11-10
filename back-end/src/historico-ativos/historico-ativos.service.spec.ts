import { Test, TestingModule } from '@nestjs/testing';
import { HistoricoAtivosService } from './historico-ativos.service';

describe('HistoricoAtivosService', () => {
  let service: HistoricoAtivosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoricoAtivosService],
    }).compile();

    service = module.get<HistoricoAtivosService>(HistoricoAtivosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
