import type { StatusPedido, CanalPedido } from "@/core/types";

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  aberto: "Aberto",
  em_producao: "Em produção",
  pronto: "Pronto",
  em_entrega: "Em entrega",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const ROTULO_CANAL: Record<CanalPedido, string> = {
  pdv: "PDV",
  app: "App do cliente",
  balcao: "Balcão",
  mesa: "Mesa",
  entrega: "Entrega",
  telefone: "Telefone",
};

export const CORES_STATUS: Record<StatusPedido, string> = {
  aberto: "border-warning/40 text-warning",
  em_producao: "border-primary/40 text-primary",
  pronto: "border-primary/40 text-primary",
  em_entrega: "border-chart-3/40 text-chart-3",
  concluido: "border-success/40 text-success",
  cancelado: "border-destructive/40 text-destructive",
};
