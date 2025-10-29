// Minimal declaration so TypeScript stops complaining
declare module "@paystack/inline-js" {
  export default class Paystack {
    constructor(options?: any);
    newTransaction(cfg: {
      key: string;
      email: string;
      amount: number;
      onload?: (response: any) => void;
      onSuccess?: (transaction: any) => void;
      onCancel?: (transaction: any) => void;
      [k: string]: any;
    }): void;
  }
}
