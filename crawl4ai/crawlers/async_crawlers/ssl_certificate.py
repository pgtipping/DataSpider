import ssl
import socket
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class SSLCertificate(BaseModel):
    issuer: str
    subject: str
    version: int
    not_before: datetime
    not_after: datetime
    serial_number: int
    fingerprint: str
    dns_names: list[str]

    @classmethod
    def from_url(cls, hostname: str, port: int = 443, timeout: float = 5.0):
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=timeout) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                cert_data = ssock.getpeercert()
                pem_cert = ssl.DER_cert_to_PEM_cert(ssock.getpeercert(binary=True))
                
                issuer = dict(x[0] for x in cert_data['issuer'])
                subject = dict(x[0] for x in cert_data['subject'])
                
                return cls(
                    issuer=str(issuer),
                    subject=str(subject),
                    version=cert_data['version'],
                    not_before=datetime.strptime(cert_data['notBefore'], '%b %d %H:%M:%S %Y %Z'),
                    not_after=datetime.strptime(cert_data['notAfter'], '%b %d %H:%M:%S %Y %Z'),
                    serial_number=cert_data['serialNumber'],
                    fingerprint=cert_data['fingerprint'],
                    dns_names=cert_data.get('subjectAltName', [])
                )
