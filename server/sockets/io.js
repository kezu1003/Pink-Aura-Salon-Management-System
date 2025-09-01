import { Server } from "socket.io";

let io = null;

export const initIO = (httpServer, cors) => {
  io = new Server(httpServer, { cors });
  io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);
    socket.on("disconnect", () => console.log("socket disconnected:", socket.id));
  });
  return io;
};

export const getIO = () => io;

// Helper to broadcast stock changes
export const emitStockUpdate = (product) => {
  if (!io || !product?._id) return;
  io.emit("stock:update", { productId: product._id.toString(), stock: product.stock });
};
