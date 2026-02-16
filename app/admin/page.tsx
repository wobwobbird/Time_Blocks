"use client";

import { useState, useEffect } from 'react';
import {
  Admin,
  Resource,
  List,
  Create,
  SimpleForm,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  TextInput,
  DateInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
} from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const dataProvider = simpleRestProvider('/api');

const CategoryList = () => (
  <List>
    <Datagrid rowClick={false}>
      <TextField source="name" />
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

const CategoryCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

const TimeEntryList = () => (
  <List>
    <Datagrid rowClick={false}>
      <DateField source="date" showTime={false} />
      <TextField source="categoryName" />
      <NumberField source="durationHours" />
      <TextField source="note" />
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

const TimeEntryCreate = () => (
  <Create>
    <SimpleForm>
      <DateInput source="date" />
      <ReferenceInput source="categoryId" reference="categories">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="durationHours" />
      <TextInput source="note" />
    </SimpleForm>
  </Create>
);

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Admin dataProvider={dataProvider}>
      <Resource name="categories" list={CategoryList} create={CategoryCreate} />
      <Resource name="time_entries" list={TimeEntryList} create={TimeEntryCreate} />
    </Admin>
  );
}

