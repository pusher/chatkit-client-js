interface BasicMessage {
  id: number;
  senderId: string;
  roomId: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export default BasicMessage;
