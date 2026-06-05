type ConfirmedBooking = {
  bookingId: string;
  service: string;
  detail: string;
  date: string;
  price: string;
  expiry: string;
};

let _confirmed: ConfirmedBooking | null = null;

export function setConfirmedBooking(b: ConfirmedBooking) {
  _confirmed = b;
}

export function getConfirmedBooking(): ConfirmedBooking | null {
  return _confirmed;
}

export function clearConfirmedBooking() {
  _confirmed = null;
}
