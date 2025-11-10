import { Test, TestingModule } from '@nestjs/testing';
import { HistoricoAtivosController } from './historico-ativos.controller';
import { HistoricoAtivosService } from './historico-ativos.service';

describe('HistoricoAtivosController', () => {
  let controller: HistoricoAtivosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoricoAtivosController],
      providers: [HistoricoAtivosService],
    }).compile();

    controller = module.get<HistoricoAtivosController>(HistoricoAtivosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
