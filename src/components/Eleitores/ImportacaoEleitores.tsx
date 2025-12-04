'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Edit2,
  Save,
  Trash2,
  Users,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Função para normalizar texto com problemas de encoding
const normalizarTexto = (texto: string): string => {
  if (!texto) return '';

  // Normalizar para lowercase e remover espaços extras
  let normalizado = texto.toLowerCase().trim();

  // Remover acentos e caracteres especiais
  normalizado = normalizado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Corrigir problemas comuns de encoding UTF-8 mal interpretado
  const correcoes: Record<string, string> = {
    // Problemas de encoding comuns (UTF-8 lido como Latin-1)
    'ã': 'a', 'â': 'a', 'á': 'a', 'à': 'a', 'ä': 'a',
    'ê': 'e', 'é': 'e', 'è': 'e', 'ë': 'e',
    'î': 'i', 'í': 'i', 'ì': 'i', 'ï': 'i',
    'ô': 'o', 'ó': 'o', 'ò': 'o', 'ö': 'o', 'õ': 'o',
    'û': 'u', 'ú': 'u', 'ù': 'u', 'ü': 'u',
    'ç': 'c', 'ñ': 'n',
    // Caracteres corrompidos comuns
    'ã': 'a', 'ã©': 'e', 'ã³': 'o', 'ã§': 'c',
    'ã£': 'a', 'ãª': 'e', 'ã­': 'i', 'ãº': 'u',
    'ã¡': 'a', 'ã©': 'e', 'ã­': 'i', 'ã³': 'o', 'ãº': 'u',
    'ã¢': 'a', 'ãª': 'e', 'ã´': 'o',
    'ã£': 'a', 'ã•': 'o', 'ã': 'a',
    'ãƒ': 'a', 'ã‰': 'e', 'ã•': 'o',
    // Caracteres especiais e símbolos
    '�': '', '\ufffd': '',
  };

  for (const [errado, certo] of Object.entries(correcoes)) {
    normalizado = normalizado.split(errado).join(certo);
  }

  // Remover caracteres não alfanuméricos exceto underscore
  normalizado = normalizado.replace(/[^a-z0-9_]/g, '');

  return normalizado;
};

// Campos disponíveis no sistema (apenas nome e telefone são obrigatórios)
const CAMPOS_SISTEMA = [
  { key: 'nomeCompleto', label: 'Nome Completo', required: true },
  { key: 'nome', label: 'Nome (primeiro)', required: false },
  { key: 'sobrenome', label: 'Sobrenome', required: false },
  { key: 'cpf', label: 'CPF', required: false },
  { key: 'telefone', label: 'Telefone', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'dataNascimento', label: 'Data de Nascimento', required: false },
  { key: 'genero', label: 'Gênero', required: false },
  { key: 'escolaridade', label: 'Escolaridade', required: false },
  { key: 'cep', label: 'CEP', required: false },
  { key: 'logradouro', label: 'Logradouro', required: false },
  { key: 'numero', label: 'Número', required: false },
  { key: 'complemento', label: 'Complemento', required: false },
  { key: 'bairro', label: 'Bairro', required: false },
  { key: 'cidade', label: 'Cidade', required: false },
  { key: 'uf', label: 'UF', required: false },
  { key: 'zonaEleitoral', label: 'Zona Eleitoral', required: false },
  { key: 'secao', label: 'Seção', required: false },
];

// Mapeamento automático de campos - usando chaves normalizadas (sem acentos, lowercase)
// As chaves aqui já estão normalizadas para comparação
const MAPEAMENTO_NORMALIZADO: Record<string, string> = {
  // Nome
  'nomecompleto': 'nomeCompleto',
  'nome_completo': 'nomeCompleto',
  'fullname': 'nomeCompleto',
  'nomeinteiro': 'nomeCompleto',
  'nome': 'nome',
  'primeiro': 'nome',
  'firstname': 'nome',
  'primeironome': 'nome',
  'sobrenome': 'sobrenome',
  'lastname': 'sobrenome',
  'ultimonome': 'sobrenome',

  // CPF
  'cpf': 'cpf',
  'documento': 'cpf',

  // Telefone
  'telefone': 'telefone',
  'celular': 'telefone',
  'fone': 'telefone',
  'phone': 'telefone',
  'tel': 'telefone',
  'whatsapp': 'telefone',
  'whats': 'telefone',
  'zap': 'telefone',
  'contato': 'telefone',
  'cellphone': 'telefone',
  'mobile': 'telefone',
  'tellider': 'telefone', // "Tel. Líder"
  'telefonelider': 'telefone',
  'fonelider': 'telefone',

  // Email
  'email': 'email',
  'mail': 'email',
  'correio': 'email',
  'emailpessoal': 'email',

  // Data de nascimento
  'datanascimento': 'dataNascimento',
  'datanasc': 'dataNascimento',
  'nascimento': 'dataNascimento',
  'dtnasc': 'dataNascimento',
  'birthday': 'dataNascimento',
  'datadenascimento': 'dataNascimento',
  'dtnascimento': 'dataNascimento',
  'aniversario': 'dataNascimento',

  // Gênero
  'genero': 'genero',
  'sexo': 'genero',
  'gender': 'genero',

  // Escolaridade
  'escolaridade': 'escolaridade',
  'formacao': 'escolaridade',
  'education': 'escolaridade',

  // Endereço
  'cep': 'cep',
  'codigopostal': 'cep',
  'zipcode': 'cep',
  'logradouro': 'logradouro',
  'endereco': 'logradouro',
  'rua': 'logradouro',
  'address': 'logradouro',
  'avenida': 'logradouro',
  'numero': 'numero',
  'num': 'numero',
  'nro': 'numero',
  'number': 'numero',
  'numerocasa': 'numero',
  'complemento': 'complemento',
  'compl': 'complemento',
  'apto': 'complemento',
  'apartamento': 'complemento',

  // Bairro / Região
  'bairro': 'bairro',
  'neighborhood': 'bairro',
  'regiao': 'bairro',
  'regiaoadministrativa': 'bairro', // "REGIÃO ADMINISTRATIVA"
  'setor': 'bairro',
  'zona': 'bairro', // pode ser zona/bairro em contextos diferentes

  // Cidade
  'cidade': 'cidade',
  'municipio': 'cidade',
  'city': 'cidade',
  'localidade': 'cidade',

  // UF
  'uf': 'uf',
  'estado': 'uf',
  'state': 'uf',
  'siglaestado': 'uf',

  // Zona/Seção eleitoral
  'zonaeleitoral': 'zonaEleitoral',
  'zona_eleitoral': 'zonaEleitoral',
  'secao': 'secao',
  'secaoeleitoral': 'secao',
};

interface ImportedRow {
  id: string;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
  duplicateOf?: {
    id: string;
    nomeCompleto: string;
    cpf?: string;
    telefone?: string;
  };
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportacaoEleitores({ onClose, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [processedData, setProcessedData] = useState<ImportedRow[]>([]);
  const [activeTab, setActiveTab] = useState<'valid' | 'duplicates'>('valid');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [criadoPorId, setCriadoPorId] = useState<string>('');

  // Buscar ID do usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setCriadoPorId(data.user.id);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };
    fetchUser();
  }, []);

  // Processar arquivo
  const processFile = useCallback(async (selectedFile: File) => {
    setLoading(true);
    setFile(selectedFile);

    try {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();

      if (extension === 'csv') {
        // Função para processar o CSV com o texto lido
        const parseCSVContent = (text: string) => {
          // Detectar delimitador (ponto e vírgula ou vírgula)
          const firstLine = text.split('\n')[0] || '';
          const semicolonCount = (firstLine.match(/;/g) || []).length;
          const commaCount = (firstLine.match(/,/g) || []).length;
          const delimiter = semicolonCount > commaCount ? ';' : ',';

          // Parse CSV com o delimitador detectado
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            delimiter: delimiter,
            complete: (results) => {
              const data = results.data as any[];
              const fileHeaders = results.meta.fields || [];

              setRawData(data);
              setHeaders(fileHeaders);
              autoMapFields(fileHeaders);
              setStep('mapping');
              setLoading(false);
            },
            error: (error: any) => {
              alert('Erro ao processar CSV: ' + error.message);
              setLoading(false);
            },
          });
        };

        // Tentar ler com UTF-8 primeiro, depois tentar Latin-1 se detectar problemas
        const reader = new FileReader();
        reader.onload = (e) => {
          let text = e.target?.result as string;

          // Verificar se há caracteres corrompidos (indicativo de encoding errado)
          const hasEncodingIssues = /[\ufffd]|Ã[£©³§ª­º¡¢´•ƒ‰]|â€|Ã‰|Ãƒ/.test(text);

          if (hasEncodingIssues) {
            // Tentar ler novamente com Latin-1 (ISO-8859-1)
            const readerLatin1 = new FileReader();
            readerLatin1.onload = (e2) => {
              const textLatin1 = e2.target?.result as string;
              parseCSVContent(textLatin1);
            };
            readerLatin1.readAsText(selectedFile, 'ISO-8859-1');
          } else {
            parseCSVContent(text);
          }
        };
        reader.readAsText(selectedFile, 'UTF-8');
      } else if (['xlsx', 'xls'].includes(extension || '')) {
        // Parse Excel
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 0) {
              const fileHeaders = (jsonData[0] as string[]).map(h => String(h || '').trim());
              const rows = jsonData.slice(1).map((row: any) => {
                const obj: Record<string, any> = {};
                fileHeaders.forEach((header, index) => {
                  obj[header] = row[index];
                });
                return obj;
              }).filter(row => Object.values(row).some(v => v !== undefined && v !== ''));

              setRawData(rows);
              setHeaders(fileHeaders);
              autoMapFields(fileHeaders);
              setStep('mapping');
            }
            setLoading(false);
          } catch (error) {
            alert('Erro ao processar Excel');
            setLoading(false);
          }
        };
        reader.readAsBinaryString(selectedFile);
      } else {
        alert('Formato não suportado. Use CSV ou Excel.');
        setLoading(false);
      }
    } catch (error) {
      alert('Erro ao processar arquivo');
      setLoading(false);
    }
  }, []);

  // Mapeamento automático de campos
  const autoMapFields = (fileHeaders: string[]) => {
    const mapping: Record<string, string> = {};

    console.log('📂 Headers encontrados no arquivo:', fileHeaders);

    fileHeaders.forEach((header) => {
      // Normalizar o cabeçalho (remove acentos, problemas de encoding, etc)
      const normalizedHeader = normalizarTexto(header);
      console.log(`🔄 Header: "${header}" → Normalizado: "${normalizedHeader}"`);

      // 1. Primeiro verificar correspondência EXATA no mapeamento normalizado
      if (MAPEAMENTO_NORMALIZADO[normalizedHeader]) {
        mapping[header] = MAPEAMENTO_NORMALIZADO[normalizedHeader];
        console.log(`✅ Mapeado (exato): "${header}" → ${MAPEAMENTO_NORMALIZADO[normalizedHeader]}`);
        return;
      }

      // 2. Buscar correspondência parcial
      for (const [key, value] of Object.entries(MAPEAMENTO_NORMALIZADO)) {
        if (normalizedHeader === key) {
          // Correspondência exata
          mapping[header] = value;
          console.log(`✅ Mapeado (exato loop): "${header}" → ${value}`);
          break;
        } else if (normalizedHeader.includes(key) && key.length >= 3) {
          // Correspondência parcial - chave contida no header (mín 3 chars)
          mapping[header] = value;
          console.log(`✅ Mapeado (parcial): "${header}" contém "${key}" → ${value}`);
          break;
        } else if (key.includes(normalizedHeader) && normalizedHeader.length >= 3) {
          // Correspondência parcial - header contido na chave (mín 3 chars)
          mapping[header] = value;
          console.log(`✅ Mapeado (parcial inverso): "${key}" contém "${normalizedHeader}" → ${value}`);
          break;
        }
      }

      if (!mapping[header]) {
        console.log(`❌ Não mapeado: "${header}" (normalizado: "${normalizedHeader}")`);
      }
    });

    console.log('📋 Mapeamento final:', mapping);
    setFieldMapping(mapping);
  };

  // Processar dados com mapeamento
  const processDataWithMapping = async () => {
    setLoading(true);

    try {
      // Verificar campos obrigatórios mapeados
      const mappedFields = Object.values(fieldMapping);

      // Nome pode ser nomeCompleto OU (nome + sobrenome) OU apenas nome
      const hasNome = mappedFields.includes('nomeCompleto') || mappedFields.includes('nome');
      const hasTelefone = mappedFields.includes('telefone');

      if (!hasNome) {
        alert('Campo obrigatório não mapeado: Nome Completo ou Nome');
        setLoading(false);
        return;
      }

      if (!hasTelefone) {
        alert('Campo obrigatório não mapeado: Telefone');
        setLoading(false);
        return;
      }

      console.log('🔄 Processando dados com mapeamento:', fieldMapping);
      console.log('📊 Total de registros raw:', rawData.length);

      // Transformar dados
      const transformed: ImportedRow[] = rawData.map((row, index) => {
        const transformedRow: Record<string, any> = {};
        const errors: string[] = [];

        if (index < 3) {
          console.log(`📝 Linha ${index + 1} - Dados raw:`, row);
        }

        // Aplicar mapeamento
        for (const [fileField, systemField] of Object.entries(fieldMapping)) {
          if (systemField && row[fileField] !== undefined) {
            transformedRow[systemField] = String(row[fileField] || '').trim();
          }
        }

        // Combinar nome + sobrenome se não tiver nomeCompleto
        if (!transformedRow.nomeCompleto && transformedRow.nome) {
          if (transformedRow.sobrenome) {
            transformedRow.nomeCompleto = `${transformedRow.nome} ${transformedRow.sobrenome}`.trim();
          } else {
            transformedRow.nomeCompleto = transformedRow.nome;
          }
        }

        // Processar CPF
        if (transformedRow.cpf) {
          transformedRow.cpf = transformedRow.cpf.replace(/\D/g, '');
          if (transformedRow.cpf.length !== 11 && transformedRow.cpf.length > 0) {
            errors.push('CPF inválido');
          }
        }

        // Processar telefone
        if (transformedRow.telefone) {
          transformedRow.telefone = transformedRow.telefone.replace(/\D/g, '');
          // Aceitar telefones com pelo menos 8 dígitos (alguns fixos antigos)
          if (transformedRow.telefone.length < 8) {
            errors.push('Telefone inválido (mínimo 8 dígitos)');
          }
        }

        // Processar data de nascimento
        if (transformedRow.dataNascimento) {
          const dateStr = transformedRow.dataNascimento;
          let parsedDate: Date | null = null;

          // Tentar diferentes formatos
          const formats = [
            /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
            /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
            /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
          ];

          for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
              if (format === formats[2]) {
                // YYYY-MM-DD
                parsedDate = new Date(match[1], parseInt(match[2]) - 1, parseInt(match[3]));
              } else {
                // DD/MM/YYYY ou DD-MM-YYYY
                parsedDate = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
              }
              break;
            }
          }

          if (parsedDate && !isNaN(parsedDate.getTime())) {
            transformedRow.dataNascimento = parsedDate.toISOString().split('T')[0];
          }
        }

        // Data de nascimento padrão se não informada
        if (!transformedRow.dataNascimento) {
          transformedRow.dataNascimento = '2000-01-01';
        }

        // Processar gênero
        if (transformedRow.genero) {
          const generoMap: Record<string, string> = {
            'm': 'MASCULINO',
            'masculino': 'MASCULINO',
            'masc': 'MASCULINO',
            'f': 'FEMININO',
            'feminino': 'FEMININO',
            'fem': 'FEMININO',
            'o': 'OUTRO',
            'outro': 'OUTRO',
            'n': 'NAO_INFORMAR',
            'nao informar': 'NAO_INFORMAR',
            'não informar': 'NAO_INFORMAR',
          };
          const normalizedGenero = transformedRow.genero.toLowerCase().trim();
          transformedRow.genero = generoMap[normalizedGenero] || 'NAO_INFORMAR';
        } else {
          transformedRow.genero = 'NAO_INFORMAR';
        }

        // Processar escolaridade
        if (transformedRow.escolaridade) {
          const escolaridadeMap: Record<string, string> = {
            'fundamental incompleto': 'FUNDAMENTAL_INCOMPLETO',
            'fundamental completo': 'FUNDAMENTAL_COMPLETO',
            'medio incompleto': 'MEDIO_INCOMPLETO',
            'médio incompleto': 'MEDIO_INCOMPLETO',
            'medio completo': 'MEDIO_COMPLETO',
            'médio completo': 'MEDIO_COMPLETO',
            'superior incompleto': 'SUPERIOR_INCOMPLETO',
            'superior completo': 'SUPERIOR_COMPLETO',
            'pos graduacao': 'POS_GRADUACAO',
            'pós graduação': 'POS_GRADUACAO',
            'mestrado': 'MESTRADO',
            'doutorado': 'DOUTORADO',
          };
          const normalizedEscolaridade = transformedRow.escolaridade.toLowerCase().trim();
          transformedRow.escolaridade = escolaridadeMap[normalizedEscolaridade] || 'MEDIO_COMPLETO';
        } else {
          transformedRow.escolaridade = 'MEDIO_COMPLETO';
        }

        // UF padrão
        if (!transformedRow.uf) {
          transformedRow.uf = 'SP';
        } else {
          transformedRow.uf = transformedRow.uf.toUpperCase().substring(0, 2);
        }

        // Cidade padrão
        if (!transformedRow.cidade) {
          transformedRow.cidade = 'Não informada';
        }

        // Bairro padrão
        if (!transformedRow.bairro) {
          transformedRow.bairro = 'Centro';
        }

        // Validar campos obrigatórios (apenas nome e telefone)
        if (!transformedRow.nomeCompleto) errors.push('Nome é obrigatório');
        if (!transformedRow.telefone) errors.push('Telefone é obrigatório');

        if (index < 3) {
          console.log(`📝 Linha ${index + 1} - Dados transformados:`, transformedRow);
          console.log(`📝 Linha ${index + 1} - Erros:`, errors);
        }

        return {
          id: `row-${index}`,
          data: transformedRow,
          isValid: errors.length === 0,
          errors,
          isDuplicate: false,
        };
      });

      const validCount = transformed.filter(r => r.isValid).length;
      const invalidCount = transformed.filter(r => !r.isValid).length;
      console.log(`✅ Válidos: ${validCount}, ❌ Inválidos: ${invalidCount}`);

      // Verificar duplicados no banco
      await checkDuplicates(transformed);

      setStep('preview');
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      alert('Erro ao processar dados');
    }

    setLoading(false);
  };

  // Verificar duplicados
  const checkDuplicates = async (data: ImportedRow[]) => {
    try {
      // Coletar CPFs e telefones para verificação
      const cpfs = data.map(d => d.data.cpf).filter(Boolean);
      const telefones = data.map(d => d.data.telefone).filter(Boolean);

      // Verificar duplicados no banco
      const response = await fetch('/api/eleitores/verificar-duplicados-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpfs, telefones }),
      });

      if (response.ok) {
        const { duplicados } = await response.json();

        // Marcar duplicados
        data.forEach((row) => {
          const dup = duplicados.find((d: any) =>
            (d.cpf && d.cpf === row.data.cpf) ||
            (d.telefone && d.telefone === row.data.telefone)
          );

          if (dup) {
            row.isDuplicate = true;
            row.duplicateOf = {
              id: dup.id,
              nomeCompleto: dup.nomeCompleto,
              cpf: dup.cpf,
              telefone: dup.telefone,
            };
          }
        });
      }

      setProcessedData(data);
    } catch (error) {
      console.error('Erro ao verificar duplicados:', error);
      setProcessedData(data);
    }
  };

  // Manipuladores de arquivo
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, [processFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  // Editar linha
  const startEdit = (row: ImportedRow) => {
    setEditingRow(row.id);
    setEditedData({ ...row.data });
  };

  const saveEdit = () => {
    setProcessedData(prev => prev.map(row => {
      if (row.id === editingRow) {
        return {
          ...row,
          data: { ...editedData },
          errors: [],
          isValid: true,
        };
      }
      return row;
    }));
    setEditingRow(null);
    setEditedData({});
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditedData({});
  };

  // Remover linha
  const removeRow = (rowId: string) => {
    setProcessedData(prev => prev.filter(row => row.id !== rowId));
  };

  // Salvar importação
  const handleSave = async () => {
    const validRows = processedData.filter(r => r.isValid && !r.isDuplicate);

    if (validRows.length === 0) {
      alert('Nenhum registro válido para importar');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/eleitores/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eleitores: validRows.map(r => ({
            ...r.data,
            criadoPorId,
            origem: 'importacao',
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.count} eleitor(es) importado(s) com sucesso!`);
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao importar');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar importação');
    }

    setSaving(false);
  };

  // Contadores
  const validCount = processedData.filter(r => r.isValid && !r.isDuplicate).length;
  const duplicateCount = processedData.filter(r => r.isDuplicate).length;
  const invalidCount = processedData.filter(r => !r.isValid).length;

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      {/* Step: Upload */}
      {step === 'upload' && (
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Processando arquivo...</p>
            </div>
          ) : (
            <>
              <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Arraste e solte seu arquivo aqui
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                ou clique para selecionar
              </p>
              <p className="text-sm text-gray-400">
                Formatos suportados: CSV, XLSX, XLS
              </p>
            </>
          )}
        </div>
      )}

      {/* Step: Mapping */}
      {step === 'mapping' && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900 dark:text-white">{file?.name}</span>
              <span className="text-sm text-gray-500">({rawData.length} registros)</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Mapeamento de Campos
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Associe os campos do arquivo com os campos do sistema. Campos com * são obrigatórios.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto mb-6">
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {header}
                  </span>
                  {rawData[0]?.[header] && (
                    <p className="text-xs text-gray-400 truncate">
                      Ex: {String(rawData[0][header]).substring(0, 30)}
                    </p>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
                <select
                  value={fieldMapping[header] || ''}
                  onChange={(e) => setFieldMapping(prev => ({
                    ...prev,
                    [header]: e.target.value,
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- Ignorar --</option>
                  {CAMPOS_SISTEMA.map((campo) => (
                    <option key={campo.key} value={campo.key}>
                      {campo.label} {campo.required ? '*' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setRawData([]);
                setHeaders([]);
                setFieldMapping({});
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Voltar
            </button>
            <button
              onClick={processDataWithMapping}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Continuar para Preview
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div>
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{validCount}</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">Válidos para importar</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-600">{duplicateCount}</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">Duplicados</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-red-600">{invalidCount}</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400">Com erros</p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab('valid')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'valid'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Dados ({validCount + invalidCount})
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'duplicates'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Duplicados ({duplicateCount})
            </button>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Nome</th>
                  <th className="px-3 py-2 text-left">CPF</th>
                  <th className="px-3 py-2 text-left">Telefone</th>
                  <th className="px-3 py-2 text-left">Cidade</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {processedData
                  .filter(row => activeTab === 'duplicates' ? row.isDuplicate : !row.isDuplicate)
                  .map((row) => (
                    <tr key={row.id} className={`
                      ${!row.isValid ? 'bg-red-50 dark:bg-red-900/10' : ''}
                      ${row.isDuplicate ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
                    `}>
                      {editingRow === row.id ? (
                        <>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={editedData.nomeCompleto || ''}
                              onChange={(e) => setEditedData(prev => ({ ...prev, nomeCompleto: e.target.value }))}
                              className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={editedData.cpf || ''}
                              onChange={(e) => setEditedData(prev => ({ ...prev, cpf: e.target.value }))}
                              className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={editedData.telefone || ''}
                              onChange={(e) => setEditedData(prev => ({ ...prev, telefone: e.target.value }))}
                              className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={editedData.cidade || ''}
                              onChange={(e) => setEditedData(prev => ({ ...prev, cidade: e.target.value }))}
                              className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-800"
                            />
                          </td>
                          <td className="px-3 py-2">-</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={saveEdit}
                              className="p-1 text-green-600 hover:bg-green-100 rounded mr-1"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {row.data.nomeCompleto || '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                            {row.data.cpf || '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                            {row.data.telefone || '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                            {row.data.cidade || '-'}
                          </td>
                          <td className="px-3 py-2">
                            {row.isDuplicate ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                Duplicado de {row.duplicateOf?.nomeCompleto}
                              </span>
                            ) : row.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                <Check className="w-3 h-3" />
                                Válido
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full" title={row.errors.join(', ')}>
                                <AlertCircle className="w-3 h-3" />
                                {row.errors[0]}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => startEdit(row)}
                              className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded mr-1"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeRow(row.id)}
                              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Ações */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('mapping')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Voltar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || validCount === 0}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar {validCount} Eleitor(es)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
