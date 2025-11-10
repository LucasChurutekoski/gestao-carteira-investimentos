import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistoricoAtivosService } from './historico-ativos.service';

@Controller('historico-ativos')
export class HistoricoAtivosController {
  constructor(private readonly historicoAtivosService: HistoricoAtivosService) {}

}
