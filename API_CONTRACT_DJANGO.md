# 🏛️ CONTRAT D'INTERFACE & SPÉCIFICATION D'API BACKEND DJANGO
## Projet : G Business Immo (Application Immobilière de Prestige)

> **Document de spécification technique pour la création du Backend Django / Django REST Framework (DRF)** destiné à remplacer toutes les fausses données (*mock / fake data*) du frontend React par des données dynamiques réelles en base de données (PostgreSQL / SQLite).

---

## 1. 🏗️ Architecture Globale & Choix Techniques

* **Backend** : Python 3.11+ / Django 5.x
* **API Engine** : Django REST Framework (DRF)
* **Authentification** : JWT (via `djangorestframework-simplejwt`) ou Token Auth DRF
* **Base de Données recommandée** : PostgreSQL (ou SQLite en dev)
* **Stockage Médias** : Gestion des images locales (`MEDIA_ROOT`) ou Stockage Cloud (AWS S3, Cloudinary)
* **CORS** : `django-cors-headers` configuré pour autoriser `http://localhost:3000` (Vite)

---

## 2. 🗄️ Modèles de Données Django (`models.py`)

### A. Modèle `Property` (Bien Immobilier)
Ce modèle correspond exactement à l'interface TypeScript `Property` de [`src/types.ts`](file:///c:/Users/isaac.kayembe/Documents/fusion_create/G-ImmoB/src/types.ts).

```python
import uuid
from django.db import models

class PropertyType(models.TextChoices):
    RESIDENTIEL = 'Résidentiel', 'Résidentiel'
    COMMERCIAL = 'Commercial', 'Commercial'
    HOTEL_PARTICULIER = 'Hôtel Particulier', 'Hôtel Particulier'
    VILLA = 'Villa', 'Villa'

class PropertyStatus(models.TextChoices):
    DISPONIBLE = 'Disponible', 'Disponible'
    EN_COURS = 'En cours', 'En cours'
    VENDU = 'Vendu', 'Vendu'
    BROUILLON = 'Brouillon', 'Brouillon'
    URGENT = 'Urgent', 'Urgent'

class Amenity(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Prestation"
        verbose_name_plural = "Prestations"


class Property(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Titre du bien")
    
    # Prix numérique pour calculs/filtres, et affichage formaté
    numeric_price = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name="Prix Numérique ($)")
    price_display = models.CharField(max_length=100, blank=True, verbose_name="Prix affiché (ex: $ 4,250,000 ou Confidentiel)")
    
    # Localisation
    location = models.CharField(max_length=255, default="Kinshasa", verbose_name="Localisation complète")
    commune = models.CharField(max_length=100, verbose_name="Commune (ex: Gombe, Ngaliema, Limete)")
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name="Adresse exacte")
    
    # Classification
    property_type = models.CharField(max_length=50, choices=PropertyType.choices, default=PropertyType.VILLA)
    status = models.CharField(max_length=50, choices=PropertyStatus.choices, default=PropertyStatus.DISPONIBLE)
    tag = models.CharField(max_length=50, blank=True, null=True, verbose_name="Badge (ex: EXCLUSIVITÉ)")
    
    # Caractéristiques physiques
    surface = models.PositiveIntegerField(verbose_name="Surface en m²")
    bedrooms = models.PositiveIntegerField(blank=True, null=True, verbose_name="Nombre de chambres")
    rooms = models.PositiveIntegerField(blank=True, null=True, verbose_name="Nombre de pièces")
    description = models.TextField(blank=True, verbose_name="Description du bien")
    
    # Relations
    amenities = models.ManyToManyField(Amenity, blank=True, related_name="properties")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Bien Immobilier"
        verbose_name_plural = "Biens Immobiliers"

    def save(self, *args, **kwargs):
        # Générer automatiquement price_display si non renseigné
        if not self.price_display and self.numeric_price:
            self.price_display = f"$ {self.numeric_price:,.0f}".replace(",", " ")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.commune}) - {self.price_display}"
```

### B. Modèle `PropertyImage` (Galerie & Carrousel d'Images)
Supporte les galeries photos nécessaires pour [`PropertyImageCarousel.tsx`](file:///c:/Users/isaac.kayembe/Documents/fusion_create/G-ImmoB/src/components/PropertyImageCarousel.tsx).

```python
class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/%Y/%m/', blank=True, null=True)
    external_url = models.URLField(max_length=1000, blank=True, null=True, verbose_name="URL directe d'image")
    is_primary = models.BooleanField(default=False, verbose_name="Image principale")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-is_primary', 'id']

    @property
    def url(self):
        if self.image:
            return self.image.url
        return self.external_url or ""
```

### C. Modèle `ContactMessage` / `Lead` (Formulaire de Contact)
Pour capturer les messages envoyés depuis [`ContactScreen.tsx`](file:///c:/Users/isaac.kayembe/Documents/fusion_create/G-ImmoB/src/screens/ContactScreen.tsx).

```python
class ContactMessage(models.Model):
    name = models.CharField(max_length=150, verbose_name="Nom complet")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=50, blank=True, null=True, verbose_name="Téléphone")
    subject = models.CharField(max_length=200, blank=True, verbose_name="Objet")
    message = models.TextField(verbose_name="Message")
    is_processed = models.BooleanField(default=False, verbose_name="Traité")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
```

---

## 3. 🔌 Spécification Détaillée des Endpoints API

Base URL suggérée : `http://localhost:8000/api/`

| Méthode | URL | Description | Accès / Rôle |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/token/` | Connexion admin (obtention JWT) | Public |
| **POST** | `/api/auth/token/refresh/` | Rafraîchissement du token JWT | Public |
| **GET** | `/api/auth/profile/` | Profil de l'administrateur connecté | Admin Authentifié |
| **GET** | `/api/properties/` | Liste filtrée des biens pour le site public | Public (Biens != Brouillon) |
| **GET** | `/api/properties/admin-all/` | Liste de tous les biens (inclus Brouillons) | Admin Authentifié |
| **GET** | `/api/properties/{id}/` | Détail d'une propriété spécifique | Public |
| **POST** | `/api/properties/` | Créer une nouvelle offre ou un brouillon | Admin Authentifié |
| **PATCH / PUT** | `/api/properties/{id}/` | Modifier une offre existante | Admin Authentifié |
| **PATCH** | `/api/properties/{id}/status/` | Mettre à jour uniquement le statut d'un bien | Admin Authentifié |
| **DELETE** | `/api/properties/{id}/` | Supprimer une offre ou un brouillon | Admin Authentifié |
| **GET** | `/api/properties/stats/` | Métriques & KPIs pour le Dashboard Admin | Admin Authentifié |
| **POST** | `/api/contact/` | Soumission du formulaire de contact client | Public |
| **GET** | `/api/contact/` | Liste des messages reçus pour l'admin | Admin Authentifié |

---

## 4. 📄 Schémas JSON (Request & Response Payloads)

### A. `GET /api/properties/`
Retourne la liste des offres publiques (filtres optionnels : `?type=Villa&commune=Gombe&budget_min=1000000&budget_max=5000000`).

#### Exemple de Réponse JSON (`200 OK`) :
```json
[
  {
    "id": "c3a1b8d2-97fc-4e6e-a2b1-123456789abc",
    "title": "Penthouse Panoramique",
    "price": "$ 4,250,000",
    "numericPrice": 4250000,
    "location": "Kinshasa, Gombe",
    "commune": "Gombe",
    "address": "Boulevard du 30 Juin",
    "type": "Résidentiel",
    "status": "Disponible",
    "surface": 240,
    "bedrooms": 4,
    "rooms": 6,
    "tag": "EXCLUSIVITÉ",
    "imageUrl": "http://localhost:8000/media/properties/penthouse_main.jpg",
    "images": [
      "http://localhost:8000/media/properties/penthouse_main.jpg",
      "http://localhost:8000/media/properties/penthouse_view1.jpg",
      "http://localhost:8000/media/properties/penthouse_view2.jpg"
    ],
    "description": "Exceptionnel penthouse offrant une vue imprenable à 360° sur la ville et le fleuve Congo...",
    "amenities": ["Piscine", "Sécurité 24/7", "Domotique", "Vue Fleuve"]
  }
]
```

> **Note clé pour le Frontend** : Le sérialiseur Django doit exposer `numericPrice` en camelCase (ou un serializer method) pour correspondre directement à l'interface TypeScript `Property` sans modification frontend.

---

### B. `POST /api/properties/`
Ajout d'une propriété (depuis l'écran [`AjouterOffreScreen.tsx`](file:///c:/Users/isaac.kayembe/Documents/fusion_create/G-ImmoB/src/screens/AjouterOffreScreen.tsx)).

#### Requête JSON (`Content-Type: application/json`) :
```json
{
  "title": "Villa Contemporaine Kinsuka",
  "numericPrice": 2500000,
  "commune": "Ngaliema",
  "address": "Avenue des Aviateurs, Kinshasa",
  "type": "Villa",
  "status": "Disponible",
  "surface": 450,
  "bedrooms": 4,
  "rooms": 5,
  "description": "Somptueuse villa neuve avec finitions soignées...",
  "amenities": ["Piscine", "Sécurité 24/7", "Domotique", "Vue Fleuve"],
  "images": [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  ]
}
```

#### Réponse JSON (`201 Created`) :
Retourne l'objet `Property` complet généré avec son `id`.

---

### C. `PATCH /api/properties/{id}/status/`
Mise à jour rapide du statut (ex: publier un brouillon, marquer comme vendu, etc.).

#### Requête :
```json
{
  "status": "Disponible"
}
```

#### Réponse (`200 OK`) :
```json
{
  "id": "c3a1b8d2-97fc-4e6e-a2b1-123456789abc",
  "status": "Disponible",
  "message": "Statut mis à jour avec succès"
}
```

---

### D. `GET /api/properties/stats/`
Pour alimenter instantanément l'onglet **Analytics** du [`DashboardAdminScreen.tsx`](file:///c:/Users/isaac.kayembe/Documents/fusion_create/G-ImmoB/src/screens/DashboardAdminScreen.tsx).

#### Réponse JSON (`200 OK`) :
```json
{
  "totalMandateValue": 28450000,
  "activeMandateValue": 11400000,
  "soldMandateValue": 15000000,
  "publishedCount": 5,
  "avgPrice": 2280000,
  "conversionRate": 67,
  "statusCounts": {
    "urgent": 1,
    "disponible": 3,
    "enCours": 2,
    "vendu": 1,
    "brouillon": 2
  }
}
```

---

### E. `POST /api/contact/`
Soumission du formulaire de contact client.

#### Requête :
```json
{
  "name": "Jean-Pierre Kabamba",
  "email": "jp.kabamba@example.com",
  "subject": "Demande de visite - Penthouse Gombe",
  "message": "Bonjour, je souhaiterais convenir d'un rendez-vous pour visiter ce bien samedi prochain."
}
```

#### Réponse (`201 Created`) :
```json
{
  "success": true,
  "message": "Votre message a été envoyé avec succès. Notre équipe vous recontactera sous 24h."
}
```

---

## 5. 🐍 Implémentation Django REST Framework Recommandée

### A. Sérialiseurs (`serializers.py`)
```python
from rest_framework import serializers
from .models import Property, PropertyImage, Amenity, ContactMessage

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name']

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'url', 'is_primary', 'order']

class PropertySerializer(serializers.ModelSerializer):
    # Mapping exact vers les noms TypeScript du frontend
    numericPrice = serializers.DecimalField(source='numeric_price', max_digits=14, decimal_places=2)
    price = serializers.CharField(source='price_display', read_only=True)
    imageUrl = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    amenities = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Amenity.objects.all(),
        required=False
    )

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'price', 'numericPrice', 'location', 'commune',
            'type', 'status', 'surface', 'bedrooms', 'rooms', 'tag',
            'imageUrl', 'images', 'description', 'amenities', 'address'
        ]

    def get_imageUrl(self, obj):
        first_img = obj.images.filter(is_primary=True).first() or obj.images.first()
        return first_img.url if first_img else ""

    def get_images(self, obj):
        return [img.url for img in obj.images.all()]
```

---

### B. Vues (`views.py`)
```python
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count, Q
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Property, PropertyImage, ContactMessage
from .serializers import PropertySerializer, ContactMessageSerializer
import json

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    queryset = Property.objects.all()
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def perform_create(self, serializer):
        property_obj = serializer.save()

        # 1. Enregistrement des fichiers locaux uploadés via FormData ('images')
        image_files = self.request.FILES.getlist('images')
        for idx, img_file in enumerate(image_files):
            PropertyImage.objects.create(
                property=property_obj,
                image=img_file,
                is_primary=(idx == 0),
                order=idx
            )

        # 2. Enregistrement des URLs externes ('image_urls')
        raw_urls = self.request.data.get('image_urls')
        if raw_urls:
            try:
                urls = json.loads(raw_urls) if isinstance(raw_urls, str) else raw_urls
                start_order = len(image_files)
                for idx, url in enumerate(urls):
                    PropertyImage.objects.create(
                        property=property_obj,
                        external_url=url,
                        is_primary=(len(image_files) == 0 and idx == 0),
                        order=start_order + idx
                    )
            except Exception:
                pass

    def get_queryset(self):
        user = self.request.user
        # Pour les visiteurs anonymes, exclure les brouillons
        if not user.is_authenticated:
            return Property.objects.exclude(status='Brouillon')
        return Property.objects.all()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def stats(self, request):
        qs = Property.objects.all()
        total_val = qs.aggregate(s=Sum('numeric_price'))['s'] or 0
        active_qs = qs.filter(status__in=['Urgent', 'Disponible', 'En cours'])
        active_val = active_qs.aggregate(s=Sum('numeric_price'))['s'] or 0
        sold_val = qs.filter(status='Vendu').aggregate(s=Sum('numeric_price'))['s'] or 0
        published_count = active_qs.count()
        avg_price = active_val // published_count if published_count > 0 else 0

        closed_or_active = qs.exclude(status='Brouillon').count()
        sold_or_progress = qs.filter(status__in=['Vendu', 'En cours']).count()
        conversion_rate = round((sold_or_progress / closed_or_active) * 100) if closed_or_active > 0 else 0

        counts = {
            'urgent': qs.filter(status='Urgent').count(),
            'disponible': qs.filter(status='Disponible').count(),
            'enCours': qs.filter(status='En cours').count(),
            'vendu': qs.filter(status='Vendu').count(),
            'brouillon': qs.filter(status='Brouillon').count(),
        }

        return Response({
            'totalMandateValue': total_val,
            'activeMandateValue': active_val,
            'soldMandateValue': sold_val,
            'publishedCount': published_count,
            'avgPrice': avg_price,
            'conversionRate': conversion_rate,
            'statusCounts': counts,
        })

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        prop = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            prop.status = new_status
            prop.save()
            return Response({'id': str(prop.id), 'status': prop.status})
        return Response({'error': 'Statut requis'}, status=status.HTTP_400_BAD_REQUEST)
```

---

### C. Configuration Django Admin (`admin.py`)
Pour afficher et gérer les images directement dans la fiche du bien dans Django Admin :

```python
from django.contrib import admin
from .models import Property, PropertyImage, Amenity

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ('image', 'external_url', 'is_primary', 'order')

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'commune', 'price_display', 'status', 'property_type', 'created_at')
    list_filter = ('status', 'property_type', 'commune')
    search_fields = ('title', 'commune', 'address', 'description')
    inlines = [PropertyImageInline]

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'is_primary', 'order', 'created_at')
    list_filter = ('is_primary',)

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('name',)
```

---

## 6. 🚀 Étapes Recommandées pour Démarrer le Backend Django

```bash
# 1. Créer le dossier et l'environnement virtuel
mkdir g_immo_backend

cd g_immo_backend
python -m venv env
source env/bin/activate  # ou env\Scripts\activate sous Windows

# 2. Installer les packages
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt pillow psycopg2-binary django-filter

# 3. Démarrer le projet
django-admin startproject core .
python manage.py startapp properties
python manage.py startapp contacts

# 4. Configurer core/settings.py
# Ajouter 'rest_framework', 'corsheaders', 'properties', 'contacts' dans INSTALLED_APPS
# Configurer CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
# Configurer MEDIA_URL et MEDIA_ROOT

# 5. Créer les migrations et migrer
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# 6. Lancer le serveur Django
python manage.py runserver 8000
```
