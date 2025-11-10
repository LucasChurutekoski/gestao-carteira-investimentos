import { Test, TestingModule } from '@nestjs/testing';
import { HistoricoRentabilidadeService } from './historico-rentabilidade.service';

describe('HistoricoRentabilidadeService', () => {
  let service: HistoricoRentabilidadeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoricoRentabilidadeService],
    }).compile();

    service = module.get<HistoricoRentabilidadeService>(HistoricoRentabilidadeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
