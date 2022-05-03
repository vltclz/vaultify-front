export type CreditProps = {
  balance: number;
  refetchBalance(address?: string): void;
};
