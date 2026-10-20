import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, ShoppingBag, Info } from 'lucide-react';
import { BuyerSale } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { getTodayDateString, formatCurrency, formatPercent } from '../utils/formatters';

interface BuyerSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleToEdit?: BuyerSale | null;
}

export const BuyerSaleModal: React.FC<BuyerSaleModalProps> = ({
  isOpen,
  onClose,
  saleToEdit
}) => {
  const { addBuyerSale, updateBuyerSale, configLists, accounts, currencySymbol } = useFinance();

  const [fecha, setFecha] = useState(getTodayDateString());
  const [comprador, setComprador] = useState('');
  const [contacto, setContacto] = useState('');
  const [productoServicio, setProductoServicio] = useState('');
  const [montoVendido, setMontoVendido] = useState('');
  const [costoProducto, setCostoProducto] = useState('');
  const [costoPagado, setCostoPagado] = useState(false);
  const [cuentaCosto, setCuentaCosto] = useState(accounts[0]?.nombre || 'Nequi');
  
  // Abono o anticipo inicial del cliente (pedidos / encargos)
  const [tieneAbonoInicial, setTieneAbonoInicial] = useState(false);
  const [montoAbonoInicial, setMontoAbonoInicial] = useState('');
  const [cuentaAbono, setCuentaAbono] = useState(accounts[0]?.nombre || 'Nequi');

  const [metodoPago, setMetodoPago] = useState(configLists.metodosPago[0] || 'Transferencia Bancaria');
  const [fechaLimite, setFechaLimite] = useState('');
  const [notas, setNotas] = useState('');
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);

  useEffect(() => {
    if (saleToEdit) {
      setFecha(saleToEdit.fecha);
      setComprador(saleToEdit.comprador);
      setContacto(saleToEdit.contacto || '');
      setProductoServicio(saleToEdit.productoServicio);
      setMontoVendido(String(saleToEdit.montoVendido));
      setCostoProducto(String(saleToEdit.costoProducto));
      setCostoPagado(Boolean(saleToEdit.costoPagado));
      setCuentaCosto(saleToEdit.cuentaCosto || accounts[0]?.nombre || 'Nequi');
      setTieneAbonoInicial(false);
      setMontoAbonoInicial('');
      setCuentaAbono(accounts[0]?.nombre || 'Nequi');
      setMetodoPago(saleToEdit.metodoPago || configLists.metodosPago[0] || 'Transferencia Bancaria');
      setFechaLimite(saleToEdit.fechaLimite || '');
      setNotas(saleToEdit.notas || '');
    } else {
      setFecha(getTodayDateString());
      setComprador('');
      setContacto('');
      setProductoServicio('');
      setMontoVendido('');
      setCostoProducto('');
      setCostoPagado(false);
      setCuentaCosto(accounts[0]?.nombre || 'Nequi');
      setTieneAbonoInicial(false);
      setMontoAbonoInicial('');
      setCuentaAbono(accounts[0]?.nombre || 'Nequi');
      setMetodoPago(configLists.metodosPago[0] || 'Transferencia Bancaria');
      setFechaLimite('');
      setNotas('');
    }
  }, [saleToEdit, isOpen, configLists, accounts]);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const numVenta = parseFloat(montoVendido) || 0;
  const numCosto = parseFloat(costoProducto) || 0;
  const gananciaCalculada = numVenta - numCosto;
  const margenCalculado = numVenta > 0 ? (gananciaCalculada / numVenta) * 100 : 0;

  const numAbono = tieneAbonoInicial ? (parseFloat(montoAbonoInicial) || 0) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numVenta <= 0) return;

    if (saleToEdit) {
      updateBuyerSale(saleToEdit.id, {
        fecha,
        comprador,
        contacto,
        productoServicio,
        montoVendido: numVenta,
        costoProducto: numCosto,
        costoPagado,
        cuentaCosto: costoPagado ? cuentaCosto : undefined,
        metodoPago,
        fechaLimite: fechaLimite || undefined,
        notas
      });
    } else {
      addBuyerSale(
        {
          fecha,
          comprador,
          contacto,
          productoServicio,
          montoVendido: numVenta,
          costoProducto: numCosto,
          costoPagado,
          cuentaCosto: costoPagado ? cuentaCosto : undefined,
          metodoPago,
          fechaLimite: fechaLimite || undefined,
          notas
        },
        tieneAbonoInicial && numAbono > 0
          ? {
              monto: numAbono,
              fecha,
              cuentaDestino: cuentaAbono,
              metodo: metodoPago,
              nota: 'Abono / Anticipo inicial del cliente'
            }
          : undefined
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              {saleToEdit ? 'Editar Venta a Comprador' : 'Registrar Venta a Comprador'}
            </h3>
            <p className="text-xs text-neutral-500">
              Control de clientes, productos vendidos, costos y márgenes de ganancia
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha de la Venta
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha Límite / Compromiso de Pago
              </label>
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nombre del Cliente / Comprador
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Distribuidora Los Andes, Mariana Gómez"
                value={comprador}
                onChange={(e) => setComprador(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Contacto (Teléfono o Email)
              </label>
              <input
                type="text"
                placeholder="+57 312 900 1122"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Producto o Servicio Vendido
            </label>
            <input
              type="text"
              required
              placeholder="Ej: 20 Unidades Smartwatch, Asesoría comercial, Ropa por mayor"
              value={productoServicio}
              onChange={(e) => setProductoServicio(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Total Vendido (Precio de Venta)
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={montoVendido}
                onChange={(e) => setMontoVendido(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Costo del Producto / Insumos
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={costoProducto}
                onChange={(e) => setCostoProducto(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Cálculo automático de Ganancia y Margen */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-500 block">Ganancia estimada:</span>
              <span className={`font-bold tabular-nums text-sm ${gananciaCalculada >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(gananciaCalculada, currencySymbol)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block">Margen de rentabilidad:</span>
              <span className="font-bold text-indigo-700 tabular-nums text-sm">
                {formatPercent(margenCalculado)}
              </span>
            </div>
          </div>

          {/* Pago al proveedor / Encargo comercial */}
          {numCosto > 0 && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={costoPagado}
                  onChange={(e) => setCostoPagado(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-neutral-900">
                  ¿Ya compraste / pagaste el valor del producto al proveedor?
                </span>
              </label>

              {costoPagado ? (
                <div className="space-y-1.5 pl-6 pt-1">
                  <label className="block text-[11px] font-semibold text-neutral-700">
                    ¿De qué cuenta salió el pago al proveedor ({formatCurrency(numCosto, currencySymbol)})?
                  </label>
                  <select
                    value={cuentaCosto}
                    onChange={(e) => setCuentaCosto(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.nombre}>
                        {acc.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-amber-800 leading-relaxed">
                    💡 Se descontará de tu extracto de {cuentaCosto} para que cuadren tus cuentas, registrado como Costo Comercial de Mercancía (NO como gasto personal de vida).
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-neutral-500 pl-6">
                  Pendiente por pagar al proveedor. Podrás marcarlo pagado cuando mandes a comprar el producto.
                </p>
              )}
            </div>
          )}

          {/* Abono / Anticipo Inicial del Cliente (Encargos y pedidos) */}
          {!saleToEdit && numVenta > 0 && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tieneAbonoInicial}
                  onChange={(e) => setTieneAbonoInicial(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-700 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-neutral-900">
                  ¿El cliente te dio un abono o anticipo inicial?
                </span>
              </label>

              {tieneAbonoInicial && (
                <div className="space-y-3 pl-6 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        Monto del Abono / Anticipo *
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        max={numVenta}
                        placeholder="Ej: 50000"
                        value={montoAbonoInicial}
                        onChange={(e) => setMontoAbonoInicial(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                        ¿En qué cuenta entró el abono? *
                      </label>
                      <select
                        value={cuentaAbono}
                        onChange={(e) => setCuentaAbono(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.nombre}>
                            {acc.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-800 leading-relaxed">
                    💡 Este dinero entrará de inmediato a tu saldo de <strong>{cuentaAbono}</strong> y la diferencia ({formatCurrency(Math.max(0, numVenta - numAbono), currencySymbol)}) quedará como saldo pendiente en <strong>Dinero por Cobrar</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tarjeta Didáctica: Flujo de Caja y Explicación de por qué NO es gasto personal */}
          <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-neutral-700" />
                <span>Flujo de Esta Operación</span>
              </span>
              <button
                type="button"
                onClick={() => setMostrarExplicacion(!mostrarExplicacion)}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{mostrarExplicacion ? 'Ocultar guía' : '¿Por qué no es gasto personal?'}</span>
              </button>
            </div>

            {mostrarExplicacion && (
              <div className="p-2.5 bg-white rounded-lg border border-indigo-100 text-[11px] text-neutral-700 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-indigo-950">
                  📌 ¿Por qué mandar a comprar el producto NO debe registrarse como gasto personal?
                </p>
                <p>
                  1. <strong>Gasto personal</strong> es tu propio consumo (comida, arriendo, servicios, salidas). No genera ingresos de vuelta.
                </p>
                <p>
                  2. <strong>Costo del encargo (Costo Comercial de Mercancía)</strong> es dinero de trabajo. El cliente te pide el producto, te abona una parte, tú compras el producto con costo de proveedor, y cobras el saldo contra entrega.
                </p>
                <p>
                  3. Si lo registras como gasto personal, tu presupuesto de vida parecería inflado artificialmente y no podrías calcular tu ganancia real neta.
                </p>
                <p className="text-emerald-800 font-medium">
                  ✅ Con este formulario, la app descuenta el costo pagado al proveedor de tu cuenta bancaria ({costoPagado ? cuentaCosto : 'pendiente'}), suma el abono del cliente ({tieneAbonoInicial ? cuentaAbono : 'sin abono aún'}), y te deja la cuenta por cobrar registrada para cobrar el resto.
                </p>
              </div>
            )}

            {/* Cuadro sinóptico de cifras */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">Total Venta</span>
                <span className="font-bold text-neutral-900 tabular-nums">
                  {formatCurrency(numVenta, currencySymbol)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-emerald-600 block">Abono Recibido</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(numAbono, currencySymbol)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-amber-600 block">Por Cobrar</span>
                <span className="font-bold text-amber-700 tabular-nums">
                  {formatCurrency(Math.max(0, numVenta - numAbono), currencySymbol)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-indigo-600 block">Ganancia Neta</span>
                <span className="font-bold text-indigo-700 tabular-nums">
                  {formatCurrency(gananciaCalculada, currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Método de Pago Acordado
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {configLists.metodosPago.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Notas / Condiciones
              </label>
              <input
                type="text"
                placeholder="Crédito a 30 días, entrega inmediata, etc."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              {saleToEdit ? 'Guardar Cambios' : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
