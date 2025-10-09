import api from "./axios"; 

export async function sendContactMessage(payload) {
  // payload = { name, email, phone, subject, message }
  const { data } = await api.post("/api/public/contact", payload);
  return data; 
}
