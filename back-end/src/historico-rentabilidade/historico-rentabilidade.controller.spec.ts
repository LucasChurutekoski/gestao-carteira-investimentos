import { Test, TestingModule } from '@nestjs/testing';
import { HistoricoRentabilidadeController } from './historico-rentabilidade.controller';
import { HistoricoRentabilidadeService } from './historico-rentabilidade.service';

describe('HistoricoRentabilidadeController', () => {
  let controller: HistoricoRentabilidadeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoricoRentabilidadeController],
      providers: [HistoricoRentabilidadeService],
    }).compile();

    controller = module.get<HistoricoRentabilidadeController>(HistoricoRentabilidadeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
