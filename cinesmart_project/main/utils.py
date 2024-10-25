# main/utils.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def load_and_preprocess_data():
    data = pd.read_csv('tmdb_5000_credits.csv')
    data = data.dropna(subset=['title'])
    data = data.reset_index(drop=True)
    return data

def create_tfidf_matrix(data):
    # Vectorize the titles using TF-IDF
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(data['title'])
    return tfidf_matrix

def compute_similarity(tfidf_matrix):
    # Compute cosine similarity between movies based on titles
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    return cosine_sim

def get_recommendations(title, data, indices, cosine_sim):
    # Ensure case-insensitive matching
    title = title.lower()
    titles_lower = data['title'].str.lower()
    if title not in titles_lower.values:
        return ["Movie not found in the dataset."]
    idx = titles_lower[titles_lower == title].index[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:11]  # Exclude the input movie itself
    movie_indices = [i[0] for i in sim_scores]
    return data[['title', 'movie_id']].iloc[movie_indices].to_dict('records')
