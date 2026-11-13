# Endpoints

Replace the example rows with your own.

| Method | Path | Who can call it | Request | Response |
| --- | --- | --- | --- | --- |
| GET | /examples | anyone (no login) | ?foo=bar | 200 with matching examples |
| POST | /examples | staff | { name, quantity } | 201 with the new example; 400 if invalid; 403 if not staff |
| | | | | |
