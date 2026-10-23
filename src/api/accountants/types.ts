export interface AccountantAssignment {
  schoolId: string;
  name: string;
}

export interface Accountant {
  id: string;
  name: string;
  email: string;
  role: 'accountant';
  active: boolean;
  assignments: AccountantAssignment[];
}

export interface CreateAccountantPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAccountantPayload {
  name?: string;
  email?: string;
  password?: string;
  active?: boolean;
}
