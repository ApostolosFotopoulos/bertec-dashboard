import pandas as pd
import numpy as np

def run_to_positive():
    df = pd.read_csv("./data/run_2belts.csv", index_col=False)
    for index in df.index:
        for col in df.columns:
            df.at[index, col] = np.absolute(df.loc[index, col])
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    print(df.head())
    df.to_csv("run_2belts.csv",index=False)
def run_add_extra_properties(): 
    df = pd.read_csv("./data/run_2belts.csv")
    df['Copx1'] = df['Fx1'] / df['Fz1']
    df['Copy1'] = df['Fy1'] / df['Fz1']
    df['Copxy1'] = np.sqrt(df['Copx1']** 2 + df['Copy1']** 2)
    df['Copx2'] = df['Fx2'] / df['Fz2']
    df['Copy2'] = df['Fy2'] / df['Fz2']
    df['Copxy2'] = np.sqrt(df['Copx2']** 2 + df['Copy2']** 2)
    df.to_csv("run_2belts.csv")
def walk_add_extra_properties():
    df = pd.read_csv("./data/walk_2belts.csv")
    df['Copx1'] = df['Fx1'] / df['Fz1']
    df['Copy1'] = df['Fy1'] / df['Fz1']
    df['Copxy1'] = np.sqrt(df['Copx1'] ** 2 + df['Copy1'] ** 2)
    df['Copx2'] = df['Fx2'] / df['Fz2']
    df['Copy2'] = df['Fy2'] / df['Fz2']
    df['Copxy2'] = np.sqrt(df['Copx2'] ** 2 + df['Copy2'] ** 2)
    df.to_csv("walk_2belts.csv")
    pass
def walk_to_positive():
    df = pd.read_csv("./data/walk_2belts.csv")
    for index in df.index:
        for col in df.columns:
            df.at[index, col] = np.absolute(df.loc[index, col])
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    df.to_csv("walk_2belts.csv",index=False)

if __name__ == "__main__":
    walk_to_positive()
