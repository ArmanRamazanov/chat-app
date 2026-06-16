export class customError extends Error {
  code: number = 0;
  details: { field: string; message: string }[] | null = [];
  constructor(
    code: number,
    message: string | "",
    details: { field: string; message: string }[] | null,
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
