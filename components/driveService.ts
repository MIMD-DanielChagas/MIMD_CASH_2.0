export const createFolderInDrive = async (
  folderName: string,
  parentPath: string,
  token: string
): Promise<string> => {
  try {
    // Encontrar o ID da pasta pai baseado no caminho
    const parentFolderId = await findFolderByPath(parentPath, token);

    // Criar a nova pasta
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar pasta: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Erro ao criar pasta no Drive:', error);
    throw error;
  }
};

export const findFolderByPath = async (path: string, token: string): Promise<string> => {
  try {
    const folders = path.split('/').filter(f => f.trim());
    let parentId = 'root';

    for (const folderName of folders) {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and parents='${parentId}' and trashed=false&spaces=drive&fields=files(id)`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar pasta: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.files.length === 0) {
        throw new Error(`Pasta não encontrada: ${folderName}`);
      }

      parentId = data.files[0].id;
    }

    return parentId;
  } catch (error) {
    console.error('Erro ao encontrar pasta:', error);
    throw error;
  }
};

export const createDatabaseFiles = async (
  folderId: string,
  companyData: any,
  token: string
): Promise<void> => {
  try {
    // Criar arquivo de configuração (JSON)
    const configContent = JSON.stringify({
      companyName: companyData.companyName,
      userName: companyData.userName,
      address: companyData.address,
      contact: companyData.contact,
      createdAt: new Date().toISOString(),
    }, null, 2);

    await createFileInDrive(
      'config.json',
      configContent,
      'application/json',
      folderId,
      token
    );

    // Criar arquivo de banco de dados (CSV)
    const databaseContent = 'id,data,descricao,valor\n'; // Cabeçalho do CSV

    await createFileInDrive(
      'database.csv',
      databaseContent,
      'text/csv',
      folderId,
      token
    );

    console.log('Arquivos de banco de dados criados com sucesso');
  } catch (error) {
    console.error('Erro ao criar arquivos de banco de dados:', error);
    throw error;
  }
};

export const createFileInDrive = async (
  fileName: string,
  content: string,
  mimeType: string,
  parentFolderId: string,
  token: string
): Promise<string> => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify({
      name: fileName,
      mimeType: mimeType,
      parents: [parentFolderId],
    })], { type: 'application/json' }));
    formData.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar arquivo: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Erro ao criar arquivo no Drive:', error);
    throw error;
  }
};
