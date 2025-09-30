export interface SubscriberType {
  value: string | number;
  label: string;
}

export const SUBSCRIBER_TYPES: SubscriberType[] = [
  { value: "", label: "-- Select Option --" },
  { value: "required", label: "Required (No Import)" },
  { value: 1, label: "Hiring Candidate" },
  { value: 2, label: "Clients" },
  { value: 3, label: "Retargeting Clients" },
  { value: 4, label: "Roadshow Clients" },
];