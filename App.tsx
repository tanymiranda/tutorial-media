import { useState, useEffect } from 'react';
import { Button, Text, SafeAreaView, ScrollView, StyleSheet, Image, View, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (!permissionResponse) {
      requestPermission();
    }
  }, [permissionResponse]);

  async function getAlbums() {
    if (permissionResponse?.status === 'granted') {
      try {
        const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
          includeSmartAlbums: true,
        });
        setAlbums(fetchedAlbums);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    } else {
      await requestPermission();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button onPress={getAlbums} title="Get albums" />
      <ScrollView>
        {albums.length > 0 ? (
          albums.map((album) => (
            <AlbumEntry key={album.id} album={album} />
          ))
        ) : (
          <Text>Não foram encontrados ativos para este álbum.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AlbumEntry({ album }: { album: MediaLibrary.Album }) {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  useEffect(() => {
    async function getAlbumAssets() {
      if (album.assetCount && album.assetCount > 0) {
        try {
          const albumAssets = await MediaLibrary.getAssetsAsync({ 
            album, 
            first: 3 
          });
          console.log(`Assets for album ${album.title}:`, albumAssets.assets);
          setAssets(albumAssets.assets);
        } catch (error) {
          console.error(`Error fetching assets for album ${album.title}:`, error);
        }
      }
    }
    getAlbumAssets();
  }, [album]);
  

  return (
    <View style={styles.albumContainer}>
      <Text style={styles.albumTitle}>
        {album.title} - {album.assetCount ?? 'no'} assets
      </Text>
      <View style={styles.albumAssetsContainer}>
        {assets.length > 0 ? (
          assets.map((asset) => (
            <Image 
              key={asset.id}
              source={{ uri: asset.uri }} 
              style={styles.thumbnail} 
            />
          ))
        ) : (
          <Text>Não foram encontrados ativos para este álbum.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    ...Platform.select({
      android: {
        paddingTop: 50,
      },
    }),
  },
  albumContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 5,
  },
  albumTitle: {
    fontSize: 20,  // Aumenta o tamanho do texto do título do álbum
    fontWeight: 'bold', // Deixa o texto em negrito
    marginBottom: 5, // Adiciona um pequeno espaçamento abaixo do título
  },
  albumAssetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginRight: 9,
  },
});
